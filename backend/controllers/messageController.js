const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
      isBroadcast: false
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendBroadcast = async (req, res) => {
  try {
    const { message } = req.body;
    const broadcast = await Message.create({
      sender: req.user._id,
      message,
      isBroadcast: true
    });
    res.status(201).json(broadcast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).populate('sender receiver', 'name role');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          }
        }
      }
    ]);
    const userIds = conversations.map(c => c._id).filter(id => id);
    const users = await User.find({ _id: { $in: userIds } }, 'name role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBroadcasts = async (req, res) => {
  try {
    const broadcasts = await Message.find({ isBroadcast: true })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage, getMessages, getConversations, sendBroadcast, getBroadcasts };