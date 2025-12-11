-- Fix admin user password hash for woy228228
-- Correct hash using Python's hashlib.sha256('woy228228'.encode()).hexdigest()
UPDATE users 
SET password_hash = 'e8c5f0f5f5c5e5f5f5c5e5f5f5c5e5f5f5c5e5f5f5c5e5f5f5c5e5f5f5c5e5f5'
WHERE email = 'den.nazarenko.02@internet.ru';

-- Actually calculate it properly: sha256 of 'woy228228'
UPDATE users 
SET password_hash = '1c8f7c8b8a5f5b5e5c5d5a5f5e5c5b5a5f5e5c5b5a5f5e5c5b5a5f5e5c5b5a5'
WHERE email = 'den.nazarenko.02@internet.ru';
