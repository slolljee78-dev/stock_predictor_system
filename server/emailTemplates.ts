/**
 * Email Templates for Trial Expiration Notifications
 * Handles formatting and content for trial-related emails
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Generate trial expiration reminder email (3 days before)
 */
export function generateTrialExpiring3DaysEmail(
  userName: string,
  expirationDate: Date,
  upgradeUrl: string
): EmailTemplate {
  const dateStr = expirationDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
          .highlight { color: #667eea; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Trial Expires Soon! 🚀</h1>
          </div>
          <div class="content">
            <p>Hi <span class="highlight">${userName}</span>,</p>
            
            <p>Your Vortex Trade trial period is expiring in <strong>3 days</strong> on <strong>${dateStr}</strong>.</p>
            
            <p>You're just getting started with AI-powered trading signals! Here's what you'll lose access to:</p>
            
            <ul>
              <li>✅ Real-time trading signals with 87% win rate</li>
              <li>✅ Advanced sentiment analysis</li>
              <li>✅ ML-powered price predictions</li>
              <li>✅ Risk management tools</li>
              <li>✅ Trading simulator with 50K+ traders</li>
              <li>✅ 24/7 market monitoring</li>
            </ul>
            
            <p><strong>Don't miss out!</strong> Upgrade now to continue using Vortex Trade and unlock premium features:</p>
            
            <a href="${upgradeUrl}" class="button">Upgrade Now</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Need help?</strong> Our support team is here to assist. Reply to this email or visit our help center.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Vortex Trade. All rights reserved.</p>
            <p>You're receiving this email because you have an active trial account.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${userName},

Your Vortex Trade trial period is expiring in 3 days on ${dateStr}.

You're just getting started with AI-powered trading signals! Here's what you'll lose access to:
- Real-time trading signals with 87% win rate
- Advanced sentiment analysis
- ML-powered price predictions
- Risk management tools
- Trading simulator with 50K+ traders
- 24/7 market monitoring

Don't miss out! Upgrade now to continue using Vortex Trade:
${upgradeUrl}

Need help? Our support team is here to assist. Reply to this email or visit our help center.

© 2026 Vortex Trade. All rights reserved.
  `.trim();

  return {
    subject: `Your Vortex Trade trial expires in 3 days - ${dateStr}`,
    html,
    text
  };
}

/**
 * Generate trial expiration reminder email (1 day before)
 */
export function generateTrialExpiring1DayEmail(
  userName: string,
  expirationDate: Date,
  upgradeUrl: string
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
          .highlight { color: #f5576c; font-weight: 600; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Last Chance! Your Trial Expires Tomorrow ⏰</h1>
          </div>
          <div class="content">
            <p>Hi <span class="highlight">${userName}</span>,</p>
            
            <div class="warning">
              <strong>⚠️ URGENT:</strong> Your trial expires <strong>tomorrow</strong>. This is your last chance to upgrade!
            </div>
            
            <p>In just 24 hours, you'll lose access to:</p>
            
            <ul>
              <li>🎯 AI-powered trading signals (87% accuracy)</li>
              <li>📊 Real-time market analysis</li>
              <li>🤖 ML-powered predictions</li>
              <li>🛡️ Advanced risk management</li>
              <li>📈 Trading simulator</li>
              <li>🔔 24/7 alerts</li>
            </ul>
            
            <p><strong>Don't let this opportunity pass!</strong> Upgrade to premium now:</p>
            
            <a href="${upgradeUrl}" class="button">Upgrade Now - Keep Your Access</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Questions? Our support team is available 24/7 to help you get started.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Vortex Trade. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${userName},

URGENT: Your trial expires TOMORROW. This is your last chance to upgrade!

In just 24 hours, you'll lose access to:
- AI-powered trading signals (87% accuracy)
- Real-time market analysis
- ML-powered predictions
- Advanced risk management
- Trading simulator
- 24/7 alerts

Don't let this opportunity pass! Upgrade to premium now:
${upgradeUrl}

Questions? Our support team is available 24/7 to help you get started.

© 2026 Vortex Trade. All rights reserved.
  `.trim();

  return {
    subject: `URGENT: Your Vortex Trade trial expires TOMORROW`,
    html,
    text
  };
}

/**
 * Generate trial expired email
 */
export function generateTrialExpiredEmail(
  userName: string,
  upgradeUrl: string
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
          .highlight { color: #667eea; font-weight: 600; }
          .pricing { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .price-item { margin: 15px 0; }
          .price-name { font-weight: 600; font-size: 16px; }
          .price-value { color: #667eea; font-size: 20px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Trial Has Ended</h1>
          </div>
          <div class="content">
            <p>Hi <span class="highlight">${userName}</span>,</p>
            
            <p>Your 7-day free trial of Vortex Trade has ended. We hope you enjoyed exploring our AI-powered trading platform!</p>
            
            <p><strong>Ready to continue?</strong> Choose a plan that works for you:</p>
            
            <div class="pricing">
              <div class="price-item">
                <div class="price-name">🚀 Starter</div>
                <div class="price-value">£9.99/month</div>
                <p style="margin: 5px 0; font-size: 14px;">Perfect for beginners</p>
              </div>
              <div class="price-item">
                <div class="price-name">⭐ Professional</div>
                <div class="price-value">£29.99/month</div>
                <p style="margin: 5px 0; font-size: 14px; color: #667eea;"><strong>Most Popular</strong></p>
              </div>
              <div class="price-item">
                <div class="price-name">👑 Elite</div>
                <div class="price-value">£99.99/month</div>
                <p style="margin: 5px 0; font-size: 14px;">For serious traders</p>
              </div>
            </div>
            
            <a href="${upgradeUrl}" class="button">View All Plans & Upgrade</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Have questions?</strong> We're here to help! Reply to this email or contact our support team.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Vortex Trade. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${userName},

Your 7-day free trial of Vortex Trade has ended. We hope you enjoyed exploring our AI-powered trading platform!

Ready to continue? Choose a plan that works for you:

🚀 Starter - £9.99/month (Perfect for beginners)
⭐ Professional - £29.99/month (Most Popular)
👑 Elite - £99.99/month (For serious traders)

View all plans and upgrade:
${upgradeUrl}

Have questions? We're here to help! Reply to this email or contact our support team.

© 2026 Vortex Trade. All rights reserved.
  `.trim();

  return {
    subject: `Your Vortex Trade trial has ended - Upgrade now`,
    html,
    text
  };
}

/**
 * Generate upgrade recommendation email
 */
export function generateUpgradeRecommendationEmail(
  userName: string,
  tradeCount: number,
  winRate: number,
  upgradeUrl: string
): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; }
          .highlight { color: #11998e; font-weight: 600; }
          .stat-box { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; margin: 10px 0; text-align: center; }
          .stat-value { font-size: 24px; font-weight: 700; color: #11998e; }
          .stat-label { font-size: 12px; color: #999; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>You're Crushing It! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi <span class="highlight">${userName}</span>,</p>
            
            <p>We've been impressed with your activity on Vortex Trade! Here's your trial performance:</p>
            
            <div class="stat-box">
              <div class="stat-value">${tradeCount}</div>
              <div class="stat-label">Trades Executed</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-value">${winRate}%</div>
              <div class="stat-label">Win Rate</div>
            </div>
            
            <p>You're showing real potential as a trader! With premium features, you could:</p>
            
            <ul>
              <li>📊 Access advanced ML models for better predictions</li>
              <li>🎯 Get priority signal alerts (before other traders)</li>
              <li>💰 Use advanced portfolio management tools</li>
              <li>🔔 Set up custom alerts and notifications</li>
              <li>📈 Track unlimited watchlists</li>
              <li>🤖 Automate your trading strategy</li>
            </ul>
            
            <p><strong>Ready to take your trading to the next level?</strong></p>
            
            <a href="${upgradeUrl}" class="button">Upgrade to Premium</a>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Special offer:</strong> Use code <span class="highlight">VORTEX20</span> for 20% off your first month!
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Vortex Trade. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hi ${userName},

We've been impressed with your activity on Vortex Trade! Here's your trial performance:

Trades Executed: ${tradeCount}
Win Rate: ${winRate}%

You're showing real potential as a trader! With premium features, you could:
- Access advanced ML models for better predictions
- Get priority signal alerts (before other traders)
- Use advanced portfolio management tools
- Set up custom alerts and notifications
- Track unlimited watchlists
- Automate your trading strategy

Ready to take your trading to the next level?
${upgradeUrl}

Special offer: Use code VORTEX20 for 20% off your first month!

© 2026 Vortex Trade. All rights reserved.
  `.trim();

  return {
    subject: `You're crushing it on Vortex Trade! 🎉 Upgrade now`,
    html,
    text
  };
}
