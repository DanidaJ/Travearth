const Badge = require('../models/Badge');
const User = require('../models/User');

/**
 * Get all badges
 * GET /api/badges
 */
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true }).sort('category tier');

    res.json({
      success: true,
      count: badges.length,
      badges
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ 
      error: 'Failed to fetch badges',
      message: error.message 
    });
  }
};

/**
 * Get user badges
 * GET /api/badges/user/:userId
 */
exports.getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('earnedBadges.badgeId');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allBadges = await Badge.find({ isActive: true });
    
    // Separate earned and unearned badges
    const earnedBadgeIds = user.earnedBadges.map(eb => eb.badgeId._id.toString());
    const earnedBadges = user.earnedBadges.map(eb => ({
      ...eb.badgeId.toObject(),
      earnedAt: eb.earnedAt,
      progress: eb.progress
    }));
    
    const unearnedBadges = allBadges
      .filter(badge => !earnedBadgeIds.includes(badge._id.toString()))
      .map(badge => ({
        ...badge.toObject(),
        progress: 0,
        locked: true
      }));

    res.json({
      success: true,
      earned: earnedBadges,
      unearned: unearnedBadges,
      totalEarned: earnedBadges.length,
      totalAvailable: allBadges.length
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user badges',
      message: error.message 
    });
  }
};

/**
 * Check and award badges to user
 * POST /api/badges/check/:userId
 */
exports.checkAndAwardBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const badges = await Badge.find({ isActive: true });
    const newlyEarned = [];

    for (const badge of badges) {
      // Check if user already has this badge
      const alreadyEarned = user.earnedBadges.some(
        eb => eb.badgeId.toString() === badge._id.toString()
      );

      if (!alreadyEarned) {
        const eligible = await badge.checkEligibility(userId);
        
        if (eligible) {
          user.earnedBadges.push({
            badgeId: badge._id,
            earnedAt: new Date(),
            progress: 100
          });
          newlyEarned.push(badge);
        }
      }
    }

    if (newlyEarned.length > 0) {
      await user.save();
    }

    res.json({
      success: true,
      newBadges: newlyEarned,
      message: newlyEarned.length > 0 
        ? `Earned ${newlyEarned.length} new badge(s)!` 
        : 'No new badges earned'
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    res.status(500).json({ 
      error: 'Failed to check badges',
      message: error.message 
    });
  }
};

/**
 * Create new badge (admin)
 * POST /api/badges/create
 */
exports.createBadge = async (req, res) => {
  try {
    const badgeData = req.body;

    const badge = await Badge.create(badgeData);

    res.status(201).json({
      success: true,
      badge
    });
  } catch (error) {
    console.error('Error creating badge:', error);
    res.status(500).json({ 
      error: 'Failed to create badge',
      message: error.message 
    });
  }
};
