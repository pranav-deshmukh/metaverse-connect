import mongoose, {Document} from "mongoose";
import bcrypt from "bcrypt";

export interface userI extends Document {
  username: string;
  email: string;
  password: string;
  correctPassword(candidatePassword: string, userPassword: string): boolean;

}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  maps:{
    type:Map,
    of:Object,
    default:new Map(),
  }
});

// userSchema.pre("save", async function () {
//   this.password = await bcrypt.hash(this.password, 12);
// });

userSchema.methods.correctPassword = async function (
  candidatePassword:string,
  userPassword:string
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model<userI>("User", userSchema);
