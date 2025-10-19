const QRCode = require('qrcode');
const Trip = require('../models/Trip');
const User = require('../models/User');

/**
 * Generate smart souvenir QR code/NFC data for trip
 * POST /api/souvenir/generate/:tripId
 */
exports.generateSouvenir = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId)
      .populate('userId', 'name avatar ecoScore')
      .populate('badgesEarned');

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Generate share code if not exists
    if (!trip.shareCode) {
      trip.generateShareCode();
      await trip.save();
    }

    // Create souvenir data
    const souvenirData = {
      tripId: trip._id,
      title: trip.title,
      shareUrl: `${process.env.FRONTEND_URL}/shared/${trip.shareCode}`,
      user: {
        name: trip.userId.name,
        ecoScore: trip.userId.ecoScore
      },
      summary: {
        duration: Math.ceil((trip.endDate - trip.startDate) / (1000 * 60 * 60 * 24)),
        destinations: trip.items.filter(i => i.type === 'destination').length,
        sustainabilityScore: trip.overallSustainabilityScore,
        carbonSaved: trip.predictedCarbon - (trip.actualCarbon || trip.predictedCarbon),
        badgesEarned: trip.badgesEarned.length
      },
      badges: trip.badgesEarned.map(b => ({
        name: b.name,
        icon: b.icon
      }))
    };

    // Generate QR code as Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(souvenirData.shareUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2,
      color: {
        dark: '#10b981', // Eco-green
        light: '#ffffff'
      }
    });

    res.json({
      success: true,
      qrCode: qrCodeDataUrl,
      shareUrl: souvenirData.shareUrl,
      shareCode: trip.shareCode,
      data: souvenirData
    });
  } catch (error) {
    console.error('Error generating souvenir:', error);
    res.status(500).json({ 
      error: 'Failed to generate souvenir',
      message: error.message 
    });
  }
};
