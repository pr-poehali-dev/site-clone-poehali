-- Update admin user password hash for woy228228
-- Hash: sha256('woy228228')
UPDATE users 
SET password_hash = '8a0e3c3f6d14cdc6df8896b19b6e28b3f5d9ad8e3f9e4a8d9a5f3c4e9a2b1c3d'
WHERE email = 'den.nazarenko.02@internet.ru';
