import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Check required environment variables
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Types
interface IUser extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

interface IEvent extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  reminder: boolean;
  reminderTime?: Date;
  category?: string;
  createdAt: Date;
}

interface AuthRequest extends Request {
  user?: { userId: string };
}

// User Schema
const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Event Schema
const eventSchema = new mongoose.Schema<IEvent>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  reminder: { type: Boolean, default: false },
  reminderTime: { type: Date },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model<IUser>('User', userSchema);
const Event = mongoose.model<IEvent>('Event', eventSchema);

// Authentication Middleware
const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

// Error Handler Middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
};

// Auth Routes
app.post('/api/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (error) {
    next(error);
  }
});

app.post('/api/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (error) {
    next(error);
  }
});

// Event Routes - Protected with auth middleware
app.post('/api/events', auth, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = new Event({
      ...req.body,
      userId: req.user?.userId
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

app.get('/api/events', auth, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const events = await Event.find({ userId: req.user?.userId });
    res.json(events);
  } catch (error) {
    next(error);
  }
});

app.put('/api/events/:id', auth, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user?.userId });
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/events/:id', auth, async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user?.userId });
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 