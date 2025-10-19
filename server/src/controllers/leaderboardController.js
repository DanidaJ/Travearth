const User = require('../models/User');

/**
 * Get global leaderboard
 * GET /api/leaderboard
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { sortBy = 'ecoScore', limit = 100 } = req.query;

    let sortField;
    switch (sortBy) {
      case 'carbonSaved':
        sortField = '-totalCarbonSaved';
        break;
      case 'trips':
        sortField = '-totalTrips';
        break;
      case 'ecoScore':
      default:
        sortField = '-ecoScore';
        break;
    }

    const users = await User.find()
      .sort(sortField)
      .limit(parseInt(limit))
      .select('name avatar ecoScore totalCarbonSaved totalTrips earnedBadges');

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      userId: user._id,
      name: user.name,
      avatar: user.avatar,
      ecoScore: user.ecoScore,
      totalCarbonSaved: user.totalCarbonSaved,
      totalTrips: user.totalTrips,
      badgeCount: user.earnedBadges.length
    }));

    res.json({
      success: true,
      sortBy,
      count: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      message: error.message 
    });
  }
};
