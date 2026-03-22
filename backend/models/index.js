// ═══════════════════════════════════════════════════
// models/index.js — All Mongoose Models
// ═══════════════════════════════════════════════════
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── GeoJSON Point helper ──
const pointSchema = new mongoose.Schema({
  type:        { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number] }   // [lng, lat]
}, { _id: false });

// ════════════════════════════════
// USER (customer)
// ════════════════════════════════
const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true, maxlength: 100 },
  phone:         { type: String, required: true, unique: true, index: true },
  password:      { type: String, select: false },
  deviceId:      { type: String, index: true },
  refreshToken:  { type: String, select: false },
  pushToken:     String,
  isBlocked:     { type: Boolean, default: false },
  totalOrders:   { type: Number, default: 0 },
  createdAt:     { type: Date,   default: Date.now }
});
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password)
    this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// ════════════════════════════════
// COURIER
// ════════════════════════════════
const courierSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  phone:             { type: String, required: true, unique: true },
  username:          { type: String, required: true, unique: true, lowercase: true, index: true },
  password:          { type: String, required: true, select: false },
  vehicle:           { type: String, enum: ['motorcycle','bicycle','car','foot'], default: 'motorcycle' },
  status:            { type: String, enum: ['pending','approved','rejected','suspended'], default: 'pending', index: true },
  isOnline:          { type: Boolean, default: false, index: true },
  location:          { type: pointSchema },
  locationUpdatedAt: Date,
  socketId:          String,

  facePhotoKey:      String,   // S3/Minio key
  passportPhotoKey:  String,

  balance:           { type: Number, default: 0 },
  totalOrders:       { type: Number, default: 0 },
  completedOrders:   { type: Number, default: 0 },
  rating:            { type: Number, default: 5.0 },
  ratingCount:       { type: Number, default: 0 },
  pushToken:         String,
  refreshToken:      { type: String, select: false },
  createdAt:         { type: Date, default: Date.now }
});
courierSchema.index({ location: '2dsphere' });
courierSchema.pre('save', async function(next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);
  next();
});
courierSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// ════════════════════════════════
// ORDER
// ════════════════════════════════
const orderSchema = new mongoose.Schema({
  // IDs
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  courierId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Courier', index: true },
  deviceId:     String,

  // Customer info
  customerName:  { type: String, required: true },
  customerPhone: { type: String, required: true },
  senderPodz:    String,
  senderFloor:   String,
  senderApart:   String,
  senderIntercom:String,

  // Addresses
  fromAddress: { type: String, required: true },
  toAddress:   { type: String, required: true },
  fromLocation: { type: pointSchema },   // { type:'Point', coordinates:[lng,lat] }
  toLocation:   { type: pointSchema },

  // Package
  description:  { type: String, default: '—' },
  weight:       { type: Number, default: 1 },
  packageType:  { type: String, enum: ['small','medium','large'], default: 'small' },

  // Receiver
  receiverName:     { type: String, required: true },
  receiverPhone:    { type: String, required: true },
  receiverPodz:     String,
  receiverFloor:    String,
  receiverApart:    String,
  receiverIntercom: String,
  note:             String,

  // Pricing
  distanceKm:  Number,
  price:       { type: Number, required: true },

  // Courier snapshot (for history)
  courierName: String,

  // Status
  status: {
    type: String,
    enum: ['new','assigned','picked_up','delivered','cancelled'],
    default: 'new',
    index: true
  },

  // Dispatch
  dispatchAttempts: { type: Number, default: 0 },
  declinedBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Courier' }],

  // Timestamps
  createdAt:    { type: Date, default: Date.now, index: true },
  assignedAt:   Date,
  pickedUpAt:   Date,
  deliveredAt:  Date,
  cancelledAt:  Date,
  updatedAt:    Date
});
orderSchema.index({ fromLocation: '2dsphere' });
orderSchema.index({ toLocation:   '2dsphere' });
orderSchema.index({ status: 1, createdAt: -1 });

// ════════════════════════════════
// ADMIN
// ════════════════════════════════
const adminSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  username:     { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, select: false },
  role:         { type: String, enum: ['super_admin','admin','moderator'], default: 'admin' },
  isActive:     { type: Boolean, default: true },
  lastLogin:    Date,
  refreshToken: { type: String, select: false },
  createdBy:    mongoose.Schema.Types.ObjectId,
  createdAt:    { type: Date, default: Date.now }
});
adminSchema.pre('save', async function(next) {
  if (this.isModified('password'))
    this.password = await bcrypt.hash(this.password, 12);
  next();
});
adminSchema.methods.comparePassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

// ════════════════════════════════
// RATING
// ════════════════════════════════
const ratingSchema = new mongoose.Schema({
  orderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  courierId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Courier', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score:      { type: Number, min: 1, max: 5, required: true },
  comment:    String,
  createdAt:  { type: Date, default: Date.now }
});

module.exports = {
  User:    mongoose.model('User',    userSchema),
  Courier: mongoose.model('Courier', courierSchema),
  Order:   mongoose.model('Order',   orderSchema),
  Admin:   mongoose.model('Admin',   adminSchema),
  Rating:  mongoose.model('Rating',  ratingSchema)
};
