-- चित्रम् (Chitram) Test Data Insert Script
-- This script adds dummy data for testing the application

USE chitram_db;

-- Insert dummy artists
INSERT INTO artists (full_name, age, started_art_since, college_school, city, district, email, phone, socials, arts_uploaded, arts_sold, bio, profile_picture, joined_at) VALUES
('राम श्रेष्ठ', 16, '2020', 'त्रिभुवन माध्यमिक विद्यालय', 'काठमाडौं', 'काठमाडौं', 'ram.shrestha@email.com', '9841234567', '{"instagram": "@ram_art", "facebook": "ram.shrestha.art"}', 5, 2, 'मलाई सानैदेखि चित्रकला मन पर्छ। मुख्यतः प्रकृति र पोर्ट्रेट बनाउँछु।', 'ram_profile.jpg', '2024-01-15 10:30:00'),

('सीता तामाङ', 17, '2019', 'हिमालय सेकेन्डरी स्कूल', 'पोखरा', 'कास्की', 'sita.tamang@email.com', '9856789012', '{"instagram": "@sita_artist", "tiktok": "@sita_art"}', 8, 3, 'मैले विभिन्न प्रकारका कलाकृति बनाउँछु। रंगीन चित्रहरू मेरो विशेषता हो।', 'sita_profile.jpg', '2024-02-20 14:15:00'),

('अर्जुन गुरुङ', 15, '2021', 'गण्डकी बोर्डिङ स्कूल', 'चितवन', 'चितवन', 'arjun.gurung@email.com', '9812345678', '{"facebook": "arjun.gurung.artist"}', 3, 1, 'स्केच र पेन्सिल आर्ट मेरो मनपर्ने क्षेत्र हो। प्रसिद्ध व्यक्तिहरूको पोर्ट्रेट बनाउँछु।', 'arjun_profile.jpg', '2024-03-10 09:45:00'),

('प्रिया राई', 16, '2020', 'सरस्वती माध्यमिक विद्यालय', 'बुटवल', 'रुपन्देही', 'priya.rai@email.com', '9823456789', '{"instagram": "@priya_creative", "youtube": "Priya Art Channel"}', 6, 2, 'मैले पानी रङ र तेल रङका चित्रहरू बनाउँछु। प्राकृतिक दृश्यहरू मेरो मुख्य विषय हो।', 'priya_profile.jpg', '2024-01-25 16:20:00');

-- Insert dummy artworks
INSERT INTO arts (art_name, artist_unique_id, art_category, cost, art_image, art_description, work_hours, size_of_art, color_type, status, uploaded_at) VALUES
('सगरमाथाको दृश्य', 1, 'Landscape', 350.00, 'sagarmatha_view.jpg', 'नेपालको गर्वको चुचुरो सगरमाथाको सुन्दर दृश्यचित्र। पानी रङले बनाइएको।', '15 घण्टा', 'A4 Size', 'color', 'listed', '2024-08-15 10:30:00'),

('मेरो आमाको पोर्ट्रेट', 1, 'Portrait', 450.00, 'mother_portrait.jpg', 'मेरी प्यारी आमाको पेन्सिल स्केच। धेरै मेहनतले बनाएको।', '20 घण्टा', '12x16 inches', 'black_and_white', 'sold', '2024-07-20 14:15:00'),

('रंगबिरंगी फूलहरू', 2, 'Abstract', 280.00, 'colorful_flowers.jpg', 'विभिन्न रंगका फूलहरूको सुन्दर संकलन। एक्रेलिक पेन्टले बनाइएको।', '12 घण्टा', 'A3 Size', 'color', 'listed', '2024-08-01 11:45:00'),

('पुरानो घर', 2, 'Architecture', 320.00, 'old_house.jpg', 'गाउँको पुरानो घरको स्केच। सम्झनाको चित्र।', '18 घण्टा', 'A4 Size', 'black_and_white', 'ordered', '2024-07-10 16:30:00'),

('बाघको आँखा', 3, 'Wildlife', 500.00, 'tiger_eyes.jpg', 'बाघको भयंकर आँखाको धेरै विस्तृत चित्र। कलर पेन्सिलले बनाइएको।', '25 घण्टा', '16x20 inches', 'color', 'listed', '2024-08-25 13:20:00'),

('फुटबल खेलाडी', 3, 'Sports', 380.00, 'football_player.jpg', 'नेपाली फुटबल खेलाडीको एक्शन स्केच।', '15 घण्टा', 'A3 Size', 'black_and_white', 'delivered', '2024-06-15 12:10:00'),

('शान्ति बुद्ध', 4, 'Religious', 420.00, 'peaceful_buddha.jpg', 'शान्त बुद्धको मुर्ति। पानी रङले बनाइएको।', '22 घण्टा', '14x18 inches', 'color', 'listed', '2024-08-20 15:45:00'),

('हिमाली बिहान', 4, 'Landscape', 390.00, 'himalayan_morning.jpg', 'हिमालको सुन्दर बिहानको दृश्य। सूर्योदयको समय।', '18 घण्टा', 'A3 Size', 'color', 'listed', '2024-08-10 09:30:00');

-- Update artist stats
UPDATE artists SET arts_uploaded = 2, arts_sold = 1 WHERE unique_id = 1;
UPDATE artists SET arts_uploaded = 2, arts_sold = 0 WHERE unique_id = 2;
UPDATE artists SET arts_uploaded = 2, arts_sold = 1 WHERE unique_id = 3;
UPDATE artists SET arts_uploaded = 2, arts_sold = 0 WHERE unique_id = 4;

-- Insert dummy contact messages
INSERT INTO contact_messages (full_name, email, phone, subject, message, status, created_at) VALUES
('सुनिल श्रेष्ठ', 'sunil.shrestha@email.com', '9841567890', 'कलाकृति बारे सोधपुछ', 'नमस्कार! मलाई तपाईंहरूको वेबसाइटमा देखाइएका कलाकृतिहरू धेरै मन परे। के म एक कस्टम पोर्ट्रेट अर्डर गर्न सक्छु?', 'unread', '2024-08-30 14:30:00'),

('रीता पौडेल', 'rita.poudel@email.com', '9856123456', 'कला प्रदर्शनी', 'हामी एक कला प्रदर्शनी आयोजना गर्दैछौं। के तपाईंका युवा कलाकारहरू सहभागी हुन चाहनुहुन्छ?', 'read', '2024-08-28 16:45:00'),

('दीपक लामा', 'deepak.lama@email.com', '9812987654', 'डेलिभरी सम्बन्धी', 'मैले गत हप्ता एक कलाकृति अर्डर गरेको थिएँ। डेलिभरी कहिले हुन्छ?', 'read', '2024-08-25 10:15:00'),

('माया गुरुङ', 'maya.gurung@email.com', '9823654789', 'कलाकार बन्न चाहन्छु', 'म पनि यस प्लेटफर्ममा कलाकार बनेर मेरा कलाकृतिहरू बेच्न चाहन्छु। कसरी सुरु गर्ने?', 'unread', '2024-08-29 12:00:00');

-- Insert dummy orders
INSERT INTO orders (order_id, customer_name, customer_phone, customer_email, shipping_address, customer_message, total_amount, item_count, item_list, creation_date_time, received_date_time, delivered_date_time, status) VALUES
('CHT001', 'अनिल खड्का', '9841234567', 'anil.khadka@email.com', 'काठमाडौं-१०, बानेश्वर, नयाँ सडक', 'कृपया सावधानीपूर्वक प्याकेजिङ गर्नुहोला।', 450.00, 1, '[{"art_id": 2, "art_name": "मेरो आमाको पोर्ट्रेट", "artist_name": "राम श्रेष्ठ", "price": 450.00, "quantity": 1}]', '2024-08-20 14:30:00', '2024-08-21 09:15:00', '2024-08-25 16:45:00', 'delivered'),

('CHT002', 'सुमित्रा भट्टराई', '9856789012', 'sumitra.bhattarai@email.com', 'पोखरा-८, लेकसाइड, मुसिकोट', 'जति सक्दो छिटो पठाउनुहोस्।', 320.00, 1, '[{"art_id": 4, "art_name": "पुरानो घर", "artist_name": "सीता तामाङ", "price": 320.00, "quantity": 1}]', '2024-08-28 11:20:00', '2024-08-28 15:30:00', NULL, 'contacted'),

('CHT003', 'राजेश महर्जन', '9812345678', 'rajesh.maharjan@email.com', 'भक्तपुर-४, दुर्बार स्क्वायर नजिक', 'यो मेरो पहिलो अर्डर हो। धन्यवाद!', 380.00, 1, '[{"art_id": 6, "art_name": "फुटबल खेलाडी", "artist_name": "अर्जुन गुरुङ", "price": 380.00, "quantity": 1}]', '2024-08-15 13:45:00', '2024-08-16 10:00:00', '2024-08-20 14:30:00', 'delivered'),

('CHT004', 'बिनिता श्रेष्ठ', '9823456789', 'binita.shrestha@email.com', 'चितवन-२, भरतपुर, पुरानो बसपार्क', 'गिफ्ट र्यापिङ गरेर पठाउनुहोस्।', 670.00, 2, '[{"art_id": 1, "art_name": "सगरमाथाको दृश्य", "artist_name": "राम श्रेष्ठ", "price": 350.00, "quantity": 1}, {"art_id": 4, "art_name": "पुरानो घर", "artist_name": "सीता तामाङ", "price": 320.00, "quantity": 1}]', '2024-08-30 16:15:00', NULL, NULL, 'placed');

-- Insert dummy page views data
INSERT INTO page_views (view_date, view_count) VALUES
('2024-08-25', 45),
('2024-08-26', 52),
('2024-08-27', 38),
('2024-08-28', 67),
('2024-08-29', 81),
('2024-08-30', 73),
('2024-08-31', 94);

-- Final status summary
SELECT 'Data insertion completed successfully!' AS status;

SELECT 
    'Artists' AS table_name, 
    COUNT(*) AS total_records 
FROM artists
UNION ALL
SELECT 
    'Arts' AS table_name, 
    COUNT(*) AS total_records 
FROM arts
UNION ALL
SELECT 
    'Contact Messages' AS table_name, 
    COUNT(*) AS total_records 
FROM contact_messages
UNION ALL
SELECT 
    'Orders' AS table_name, 
    COUNT(*) AS total_records 
FROM orders
UNION ALL
SELECT 
    'Page Views' AS table_name, 
    COUNT(*) AS total_records 
FROM page_views;
