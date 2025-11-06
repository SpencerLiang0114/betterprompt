module.exports = (req, res) => {
  res.status(200).json({ ok: true, ts: Date.now(), hasKey: !!process.env.OPENAI_API_KEY });
};
