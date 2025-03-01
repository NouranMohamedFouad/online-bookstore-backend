import process from "node:process";
import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.createConnection(process.env.DB_CONNECTION_STRING);
const AutoIncrement = AutoIncrementFactory(connection);

const userSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    min: [1, "User ID must be at least 1"],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [3, "Name must be at least 3 characters"],
    maxlength: [30, "Name cannot exceed 30 characters"],
    match: [
      /^[A-Z]+(\s[A-Z]+)*$/i,
      "Name should contain only letters and must not be spaces only",
    ],
    set: (value) => value.replace(/\b\w/g, (char) => char.toUpperCase()),
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, "Invalid email format"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    maxlength: [32, "Password must not exceed 32 characters"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/,
      "Password must be 8-32 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
    ],
  },
  role: {
    type: String,
    enum: ["superadmin", "admin", "seller", "delivery", "customer"],
    default: "customer",
    required: true,
  },
  address: {
    street: {
      type: String,
      trim: true,
      minlength: [3, "Street must be at least 3 characters long"],
    },
    city: {
      type: String,
      match: [/^[A-Z\s]+$/i, "City should contain only letters"],
    },
    state: {
      type: String,
      match: [/^[A-Z\s]+$/i, "State should contain only letters"],
    },
    postalCode: {
      type: String,
      match: [/^\d{4,6}$/, "Postal Code must be 4 to 6 digits"],
    },
    country: {
      type: String,
      default: "Egypt",
      match: [/^[A-Z\s]+$/i, "Country should contain only letters"],
    },
    required: false,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\+?\d{7,15}$/, "Invalid phone number format"],
    trim: true,
  },
});

userSchema.plugin(AutoIncrement, { inc_field: "user_id" });

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const users = mongoose.model("Users", userSchema);

export default users;
