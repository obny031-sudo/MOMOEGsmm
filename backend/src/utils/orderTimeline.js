async function appendTimeline(order, event, message = "", meta = {}) {
  if (!order.timeline) order.timeline = [];
  order.timeline.push({ event, message, meta });
  return order;
}

module.exports = { appendTimeline };
