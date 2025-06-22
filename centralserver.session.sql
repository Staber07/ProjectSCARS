-- Remove otpSecret for a specific user by setting it to NULL
UPDATE users
SET otpVerified = 0,
    otpSecret = NULL
WHERE id = '2927459b-2306-4a61-9e8a-00a889963ba1';