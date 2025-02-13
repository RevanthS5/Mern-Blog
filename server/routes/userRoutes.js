const { Router } = require('express');

const { registerUser, loginUser, logoutUser, getUser, changeAvatar, editUser, getAuthors, getMe } = require('../controllers/userControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout/:id', logoutUser);
router.get('/me', authMiddleware, getMe);  // ✅ Moved this above /:id
router.get('/', getAuthors);
router.post('/change-avatar', authMiddleware, changeAvatar);
router.patch('/edit-user', authMiddleware, editUser);
router.get('/:id', getUser);  // ✅ Now this won’t override "/me"

module.exports = router;
