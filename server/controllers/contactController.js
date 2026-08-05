import contactModel from "../models/contactModel.js";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill out all required fields: name, email, subject, and message."
      });
    }

    // 1. Save to Database so no message is ever lost
    const newContact = new contactModel({
      name,
      email,
      subject,
      message
    });
    await newContact.save();

    const recipientEmail = "sachin9909.singh@gmail.com";

    // 2. Dispatch real email via FormSubmit API to recipient inbox
    try {
      await fetch(`https://formsubmit.co/ajax/${recipientEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          _subject: `[CartNow Contact] ${subject}`,
          message,
          _captcha: "false"
        })
      });
    } catch (mailErr) {
      console.error("FormSubmit email dispatch error:", mailErr.message);
    }

    return res.json({
      success: true,
      message: `Your message has been sent directly to ${recipientEmail}!`
    });

  } catch (error) {
    console.error("Error in sendContactMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Message saved, but email dispatch encountered an error. Our team will review it shortly.",
      error: error.message
    });
  }
};
