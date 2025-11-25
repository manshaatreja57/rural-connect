import { Router } from "express";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js";
import Message from "../models/Message.js";
import Worker from "../models/Worker.js";
import User from "../models/User.js";

const router = Router();

/* ----------------------------------------
   BUILD QUERY FOR BOTH SIDES OF CHAT
---------------------------------------- */
const buildConversationQuery = (userA, userB) => ({
  $or: [
    {
      senderId: new mongoose.Types.ObjectId(userA),
      receiverId: new mongoose.Types.ObjectId(userB),
    },
    {
      senderId: new mongoose.Types.ObjectId(userB),
      receiverId: new mongoose.Types.ObjectId(userA),
    },
  ],
});

/* ----------------------------------------
   FORMAT MESSAGES CLEANLY
---------------------------------------- */
const formatMessages = (messages) =>
  messages.map((msg) => ({
    _id: msg._id,
    sender: msg.senderId,
    receiver: msg.receiverId,
    message: msg.message,
    timestamp: msg.timestamp,
  }));

/* ----------------------------------------
   GET CHAT WITH WORKER
---------------------------------------- */
router.get("/worker/:workerId", auth, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.workerId).populate(
      "userId",
      "name email"
    );

    if (!worker || !worker.userId) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const workerUserId = worker.userId._id;

    const messages = await Message.find(
      buildConversationQuery(req.user._id, workerUserId)
    )
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      partner: {
        type: "worker",
        id: worker._id,
        userId: workerUserId,
        name: worker.userId.name,
        email: worker.userId.email,
      },
      messages: formatMessages(messages),
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
});

/* ----------------------------------------
   GET CHAT WITH USER
---------------------------------------- */
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const partner = await User.findById(req.params.userId).select(
      "name email"
    );

    if (!partner) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find(
      buildConversationQuery(req.user._id, partner._id)
    )
      .sort({ timestamp: 1 })
      .lean();

    res.json({
      partner: {
        type: "user",
        userId: partner._id,
        name: partner.name,
        email: partner.email,
      },
      messages: formatMessages(messages),
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
});

/* ----------------------------------------
   SEND MESSAGE (USER ↔ WORKER / USER ↔ USER)
---------------------------------------- */
router.post("/send", auth, async (req, res) => {
  try {
    const { workerId, userId, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message text is required" });
    }

    let receiverUserId = null;

    if (workerId) {
      const worker = await Worker.findById(workerId).populate(
        "userId",
        "name email"
      );
      if (!worker || !worker.userId) {
        return res.status(404).json({ message: "Worker not found" });
      }
      receiverUserId = worker.userId._id;
    } else if (userId) {
      const partner = await User.findById(userId);
      if (!partner) {
        return res.status(404).json({ message: "User not found" });
      }
      receiverUserId = partner._id;
    } else {
      return res
        .status(400)
        .json({ message: "workerId or userId must be provided" });
    }

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId: receiverUserId,
      message,
      timestamp: new Date(),
    });

    res.status(201).json({
      _id: newMessage._id,
      sender: newMessage.senderId,
      receiver: newMessage.receiverId,
      message: newMessage.message,
      timestamp: newMessage.timestamp,
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ message: "Failed to send message" });
  }
});

/* ----------------------------------------
   GET ALL CONVERSATIONS LIST (LEFT SIDEBAR)
---------------------------------------- */
router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // Find partners
    const partners = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $project: {
          otherUser: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
          message: 1,
          timestamp: 1,
        },
      },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$message" },
          lastTimestamp: { $first: "$timestamp" },
        },
      },
      { $sort: { lastTimestamp: -1 } },
    ]);

    // Get user detail
    const list = await Promise.all(
      partners.map(async (p) => {
        const u = await User.findById(p._id).select("name email");
        return {
          userId: u._id,
          name: u.name,
          email: u.email,
          lastMessage: p.lastMessage,
          lastTimestamp: p.lastTimestamp,
        };
      })
    );

    res.json(list);
  } catch (e) {
    console.error("Error loading conversations:", e);
    res.status(500).json({ message: "Failed to load conversations" });
  }
});

export default router;
