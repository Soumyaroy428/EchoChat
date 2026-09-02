import mongoose from "mongoose";

const newContactSchema = new mongoose.Schema({
  avatar: {
    type: String,
    default: "",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    },
  active: {
    type: Boolean,
    default: true,
  },
});

export default mongoose.model("NewContact", newContactSchema);
