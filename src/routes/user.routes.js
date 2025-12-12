import express from 'express'
import passport from 'passport'
import { generalValidation } from '~/validations/general.validation.js'
import { userValidation } from '~/validations/user.validation.js'
import { userController } from '~/controllers/user.controller.js'
import { verifyToken } from '~/middlewares/auth.middleware.js'
import { userBadgeController } from '~/controllers/userBadge.controller.js'
import { categoryController } from '~/controllers/category.controller.js'
import { loginRateLimiter, registerRateLimiter, verifyOtpRateLimiter } from '~/middlewares/limiter.middleware.js'

const Router = express.Router()

// --- Authentication & Authorization ---
Router.post('/register', registerRateLimiter, userValidation.register, userController.register)
Router.post('/login', loginRateLimiter, userValidation.login, userController.login)
Router.post('/logout', verifyToken, userController.logout)
Router.post('/request-token', userValidation.requestToken, userController.requestToken)
Router.post('/verify-email', userValidation.verifyOTP, userController.verifyEmail)
Router.post('/resend-registration-otp', generalValidation.emailValidation, userController.resendRegistrationOTP)

// --- Password Management ---
Router.post('/forgot-password', verifyOtpRateLimiter, generalValidation.emailValidation, userController.sendPasswordResetOTP)
Router.post('/verify-password-otp', userValidation.verifyOTP, userController.verifyPasswordResetOTP)
Router.post('/reset-password', userValidation.resetPassword, userController.resetPassword)
Router.put('/change-password', verifyToken, userValidation.changePassword, userController.changePassword)

Router.get('/profile', verifyToken, userController.getProfile)

// --- Badge & Points ---
Router.post('/actions', verifyToken, userController.trackUserAction)
Router.get('/badges', verifyToken, userBadgeController.getBadges)
Router.get('/badges/history', verifyToken, userBadgeController.getPointHistory)

// --- Category Routes ---
Router.get('/categories', categoryController.getAllCategories)


// Route for Facebook login
Router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }))
Router.get(
  '/auth/facebook/callback',
  (req, res, next) => {
    // Check for OAuth errors before Passport processes
    if (req.query.error) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const script = `
        <script>
          (function(){
            var client = ${JSON.stringify(clientUrl)};
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ error: ${JSON.stringify(req.query.error)} }, client);
              window.close();
              return;
            }
            window.location.href = client + '/auth/login';
          })();
        </script>
      `;
      return res.send(script);
    }
    next();
  },
  passport.authenticate('facebook', { session: false }),
  userController.oAuthLoginCallback
)
// Google login
Router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
Router.get(
  '/auth/google/callback',
  (req, res, next) => {
    // Check for OAuth errors before Passport processes
    if (req.query.error) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const script = `
        <script>
          (function(){
            var client = ${JSON.stringify(clientUrl)};
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ error: ${JSON.stringify(req.query.error)} }, client);
              window.close();
              return;
            }
            window.location.href = client + '/auth/login';
          })();
        </script>
      `;
      return res.send(script);
    }
    next();
  },
  passport.authenticate('google', { session: false }),
  userController.oAuthLoginCallback
)

Router.get('/outstanding-bloggers', userController.getOutstandingBloggers)
Router.put('/location', verifyToken, userValidation.updateUserLocation, userController.updateUserLocation)
Router.put('/me/ban', verifyToken, userController.banSelf)

// --- General User Routes ---
Router.get('/blogs', verifyToken, userController.getUserBlogs)
Router.get('/leaderboard', userController.getLeaderboard)

Router.get('/:id', userController.getUserDetails)

export const userRoute = Router
