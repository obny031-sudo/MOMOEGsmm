const Ticket = require("../models/Ticket");

exports.getMyTickets = async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id }).sort({
    updatedAt: -1,
  });
  res.json({ success: true, tickets });
};

exports.createTicket = async (req, res) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({
      success: false,
      message: "Subject and message required",
    });
  }
  const ticket = await Ticket.create({
    user: req.user._id,
    subject,
    messages: [{ sender: "user", message }],
  });
  res.status(201).json({ success: true, ticket });
};

exports.replyTicket = async (req, res) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!ticket) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
  ticket.messages.push({ sender: "user", message: req.body.message });
  ticket.status = "Open";
  await ticket.save();
  res.json({ success: true, ticket });
};
