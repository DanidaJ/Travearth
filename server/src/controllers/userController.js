const User = require('../models/User');

/**
 * Create new user
 * POST /api/users/create
 */
exports.createUser = async (req, res) => {
  try {
    const { email, name, avatar } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['email', 'name']
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email' 
      });
    }

    const user = await User.create({ email, name, avatar });

    res.status(201).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      message: error.message 
    });
  }
};

/**
 * Get user
 * GET /api/users/:id
 */
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('earnedBadges.badgeId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      message: error.message 
    });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'email') {
        user[key] = updates[key];
      }
    });

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      error: 'Failed to update user',
      message: error.message 
    });
  }
};

/**
 * Get user eco-score
 * GET /api/users/:id/eco-score
 */
exports.getEcoScore = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Recalculate eco-score
    await user.calculateEcoScore();
    await user.save();

    res.json({
      success: true,
      ecoScore: user.ecoScore,
      totalCarbonSaved: user.totalCarbonSaved,
      totalTrips: user.totalTrips,
      badges: user.earnedBadges.length
    });
  } catch (error) {
    console.error('Error fetching eco-score:', error);
    res.status(500).json({ 
      error: 'Failed to fetch eco-score',
      message: error.message 
    });
  }
};
