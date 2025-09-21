-- Migration: Seed Initial Robot Data
-- Description: Insert initial manufacturers, categories, and robot data including Tesla Optimus, Boston Dynamics Atlas, and Figure 01
-- Dependencies: Requires 002_create_robot_database_tables.sql to be applied first
-- Author: RoboStorm Development Team
-- Date: 2025-09-21

-- ============================================================================
-- SEED MANUFACTURERS
-- ============================================================================

INSERT INTO manufacturers (name, slug, website, country, founded_year, description, logo_url, is_active) VALUES
('Tesla, Inc.', 'tesla', 'https://www.tesla.com', 'United States', 2003, 'American multinational automotive and clean energy company known for electric vehicles and innovative technology, including the development of humanoid robots.', null, true),
('Boston Dynamics', 'boston-dynamics', 'https://www.bostondynamics.com', 'United States', 1992, 'American engineering and robotics design company known for creating highly mobile robots with dynamic movement capabilities.', null, true),
('Figure AI, Inc.', 'figure-ai', 'https://www.figure.ai', 'United States', 2022, 'AI robotics company focused on developing general purpose humanoid robots for commercial applications.', null, true),
('Honda Motor Co.', 'honda', 'https://global.honda', 'Japan', 1948, 'Japanese multinational conglomerate known for automobiles and motorcycles, and pioneer in humanoid robotics with ASIMO.', null, true),
('SoftBank Robotics', 'softbank-robotics', 'https://www.softbankrobotics.com', 'Japan', 2012, 'Robotics company specializing in humanoid and service robots for consumer and business applications.', null, true),
('Hanson Robotics', 'hanson-robotics', 'https://www.hansonrobotics.com', 'Hong Kong', 2013, 'AI and robotics company focused on creating socially intelligent machines and lifelike humanoid robots.', null, true);

-- ============================================================================
-- SEED ROBOT CATEGORIES
-- ============================================================================

INSERT INTO robot_categories (name, slug, description, sort_order, icon_name, color_hex, is_active) VALUES
('Humanoid Assistants', 'humanoid-assistants', 'General-purpose humanoid robots designed to assist humans in various tasks and environments.', 1, 'user-check', '#3B82F6', true),
('Research Platforms', 'research-platforms', 'Advanced robotics platforms primarily used for research and development in robotics and AI.', 2, 'microscope', '#10B981', true),
('Entertainment Robots', 'entertainment-robots', 'Robots designed for entertainment, social interaction, and demonstration purposes.', 3, 'smile', '#F59E0B', true),
('Industrial Humanoids', 'industrial-humanoids', 'Humanoid robots designed for industrial applications, manufacturing, and commercial use.', 4, 'settings', '#EF4444', true),
('Service Robots', 'service-robots', 'Robots designed to provide services in hospitality, healthcare, and customer service environments.', 5, 'heart-handshake', '#8B5CF6', true),
('Prototype Robots', 'prototype-robots', 'Experimental and prototype robots in development or demonstration phases.', 6, 'flask', '#6B7280', true);

-- ============================================================================
-- SEED ROBOTS
-- ============================================================================

-- Tesla Optimus (Generation 2)
INSERT INTO robots (
    name, slug, manufacturer_id, model_number, version, is_latest_version,
    release_date, announcement_date, status,
    height_cm, weight_kg,
    battery_type, battery_life_hours,
    degrees_of_freedom,
    operating_temperature_min, operating_temperature_max,
    ai_capabilities,
    operating_system,
    sensors,
    estimated_price_usd,
    availability_status,
    description,
    features,
    applications,
    use_cases,
    meta_title, meta_description,
    featured_image_url,
    official_website,
    wikipedia_url,
    is_featured, is_verified, is_prototype
) VALUES (
    'Tesla Optimus',
    'tesla-optimus-gen2',
    (SELECT id FROM manufacturers WHERE slug = 'tesla'),
    'Bot',
    'Generation 2',
    true,
    '2023-12-01',
    '2021-08-19',
    'development',
    173,
    73,
    'Lithium-ion',
    null,
    28,
    -10,
    40,
    ARRAY['computer_vision', 'natural_language_processing', 'path_planning', 'object_manipulation'],
    'Tesla FSD Computer',
    '{"cameras": {"count": 8, "types": ["RGB", "depth"]}, "sensors": ["IMU", "force_torque_sensors"], "lidar": false}',
    30000,
    'pre-order',
    'Optimus, also known as Tesla Bot, is a general-purpose humanoid robot under development by Tesla, Inc. Designed to perform dangerous, repetitive, and boring tasks, Optimus aims to be a versatile assistant for both industrial and domestic applications.',
    ARRAY['Bipedal locomotion', 'Object manipulation', 'Autonomous navigation', 'Tesla AI integration', 'Human-like proportions'],
    ARRAY['Manufacturing assistance', 'Household tasks', 'Elder care', 'Dangerous environment operations'],
    ARRAY['Factory automation', 'Home assistance', 'Logistics and warehousing', 'Research and development'],
    'Tesla Optimus Generation 2 - Advanced Humanoid Robot',
    'Tesla Optimus Gen 2 is a cutting-edge humanoid robot designed for general-purpose tasks with advanced AI capabilities and human-like proportions.',
    'https://example.com/tesla-optimus-gen2.jpg',
    'https://www.tesla.com/AI',
    'https://en.wikipedia.org/wiki/Optimus_(robot)',
    true,
    true,
    true
);

-- Boston Dynamics Atlas (Electric Model)
INSERT INTO robots (
    name, slug, manufacturer_id, model_number, version, is_latest_version,
    release_date, announcement_date, status,
    height_cm, weight_kg,
    degrees_of_freedom,
    operating_temperature_min, operating_temperature_max,
    ai_capabilities,
    sensors,
    estimated_price_usd,
    availability_status,
    description,
    features,
    applications,
    use_cases,
    meta_title, meta_description,
    featured_image_url,
    official_website,
    wikipedia_url,
    is_featured, is_verified
) VALUES (
    'Atlas',
    'boston-dynamics-atlas-electric',
    (SELECT id FROM manufacturers WHERE slug = 'boston-dynamics'),
    'Atlas',
    'Electric Model',
    true,
    '2024-04-17',
    '2013-07-11',
    'active',
    150,
    89,
    28,
    -20,
    45,
    ARRAY['dynamic_locomotion', 'computer_vision', 'path_planning', 'object_manipulation', 'balance_control'],
    '{"cameras": {"count": 4, "types": ["RGB", "depth"]}, "lidar": {"count": 1, "type": "spinning"}, "imu": true, "force_sensors": true}',
    null,
    'limited',
    'Atlas is a bipedal humanoid robot developed by Boston Dynamics. Designed for search and rescue tasks, Atlas demonstrates remarkable agility, balance, and mobility in challenging environments.',
    ARRAY['Dynamic locomotion', 'Parkour capabilities', 'Object manipulation', 'Rough terrain navigation', 'Advanced balance control'],
    ARRAY['Search and rescue', 'Disaster response', 'Research and development', 'Military applications'],
    ARRAY['Emergency response', 'Hazardous environment exploration', 'Robotics research', 'Technology demonstration'],
    'Boston Dynamics Atlas - Advanced Bipedal Robot',
    'Atlas by Boston Dynamics is a state-of-the-art bipedal robot with exceptional mobility and agility for search and rescue operations.',
    'https://example.com/boston-dynamics-atlas.jpg',
    'https://www.bostondynamics.com/atlas',
    'https://en.wikipedia.org/wiki/Atlas_(robot)',
    true,
    true
);

-- Figure 01
INSERT INTO robots (
    name, slug, manufacturer_id, model_number, version, is_latest_version,
    release_date, announcement_date, status,
    height_cm, weight_kg,
    ai_capabilities,
    estimated_price_usd,
    availability_status,
    description,
    features,
    applications,
    use_cases,
    meta_title, meta_description,
    featured_image_url,
    official_website,
    wikipedia_url,
    is_featured, is_verified
) VALUES (
    'Figure 01',
    'figure-ai-figure-01',
    (SELECT id FROM manufacturers WHERE slug = 'figure-ai'),
    'Figure 01',
    '1.0',
    true,
    '2022-01-01',
    '2022-01-01',
    'development',
    175,
    85,
    ARRAY['computer_vision', 'natural_language_processing', 'manipulation_planning', 'autonomous_navigation'],
    null,
    'custom-only',
    'Figure 01 is a bipedal humanoid robot developed by Figure AI, designed specifically for manual labor and commercial applications in warehouses and logistics.',
    ARRAY['Bipedal locomotion', 'Precise manipulation', 'Warehouse navigation', 'AI-powered decision making'],
    ARRAY['Warehouse automation', 'Manufacturing', 'Logistics', 'Manual labor tasks'],
    ARRAY['Package handling', 'Inventory management', 'Assembly line work', 'Material transport'],
    'Figure 01 - Commercial Humanoid Robot for Labor',
    'Figure 01 by Figure AI is a commercial-grade humanoid robot designed for manual labor and warehouse automation applications.',
    'https://example.com/figure-01.jpg',
    'https://www.figure.ai',
    'https://en.wikipedia.org/wiki/Figure_AI',
    true,
    true
);

-- Additional popular robots for demonstration

-- Honda ASIMO (Final Version)
INSERT INTO robots (
    name, slug, manufacturer_id, model_number, version, is_latest_version,
    release_date, announcement_date, status,
    height_cm, weight_kg,
    walking_speed_kmh,
    degrees_of_freedom,
    ai_capabilities,
    sensors,
    availability_status,
    description,
    features,
    applications,
    meta_title, meta_description,
    is_featured, is_verified
) VALUES (
    'ASIMO',
    'honda-asimo-final',
    (SELECT id FROM manufacturers WHERE slug = 'honda'),
    'ASIMO',
    'Final Version (2011)',
    true,
    '2011-11-08',
    '2000-10-31',
    'discontinued',
    130,
    50,
    2.7,
    34,
    ARRAY['speech_recognition', 'face_recognition', 'gesture_recognition', 'autonomous_navigation'],
    '{"cameras": {"count": 2, "types": ["RGB"]}, "microphones": 8, "gyroscope": true, "accelerometer": true}',
    'discontinued',
    'ASIMO (Advanced Step in Innovative Mobility) was a humanoid robot developed by Honda. It was one of the first robots to demonstrate advanced bipedal locomotion and human-robot interaction capabilities.',
    ARRAY['Bipedal walking', 'Stair climbing', 'Object recognition', 'Speech interaction', 'Gesture recognition'],
    ARRAY['Research and development', 'Technology demonstration', 'Educational purposes'],
    'Honda ASIMO - Pioneer Humanoid Robot',
    'Honda ASIMO was a groundbreaking humanoid robot that pioneered bipedal locomotion and human-robot interaction technologies.',
    false,
    true
);

-- SoftBank Pepper
INSERT INTO robots (
    name, slug, manufacturer_id, model_number, version, is_latest_version,
    release_date, announcement_date, status,
    height_cm, weight_kg,
    ai_capabilities,
    sensors,
    estimated_price_usd,
    availability_status,
    description,
    features,
    applications,
    meta_title, meta_description,
    is_featured, is_verified
) VALUES (
    'Pepper',
    'softbank-pepper',
    (SELECT id FROM manufacturers WHERE slug = 'softbank-robotics'),
    'Pepper',
    '1.8a',
    true,
    '2014-06-05',
    '2014-06-05',
    'active',
    120,
    28,
    ARRAY['emotion_recognition', 'speech_recognition', 'natural_language_processing', 'social_interaction'],
    '{"cameras": {"count": 3, "types": ["RGB", "3D"]}, "microphones": 4, "touch_sensors": true, "sonar": 2, "laser": 6, "bumper": 3, "gyroscope": 1}',
    15000,
    'available',
    'Pepper is a semi-humanoid robot designed to be a companion and interact with humans in a natural, intuitive way. It''s equipped with emotion recognition and is used in retail and hospitality.',
    ARRAY['Emotion recognition', 'Natural conversation', 'Touch interaction', 'Mobile base with wheels', 'Tablet interface'],
    ARRAY['Customer service', 'Retail assistance', 'Healthcare companionship', 'Education'],
    'SoftBank Pepper - Social Humanoid Robot',
    'Pepper by SoftBank Robotics is an emotion-sensing humanoid robot designed for social interaction and customer service applications.',
    false,
    true
);

-- Hanson Robotics Sophia
INSERT INTO robots (
    name, slug, manufacturer_id, model_number, version, is_latest_version,
    release_date, announcement_date, status,
    height_cm, weight_kg,
    ai_capabilities,
    sensors,
    availability_status,
    description,
    features,
    applications,
    meta_title, meta_description,
    is_featured, is_verified
) VALUES (
    'Sophia',
    'hanson-robotics-sophia',
    (SELECT id FROM manufacturers WHERE slug = 'hanson-robotics'),
    'Sophia',
    '2016',
    true,
    '2016-02-14',
    '2016-02-14',
    'active',
    162,
    45,
    ARRAY['natural_language_processing', 'facial_recognition', 'emotional_expression', 'conversation_ai'],
    '{"cameras": {"count": 2, "types": ["RGB"]}, "microphones": 1, "facial_actuators": 62}',
    'custom-only',
    'Sophia is a social humanoid robot developed by Hanson Robotics, known for her lifelike appearance and ability to engage in conversation. She became the first robot to receive citizenship of any country.',
    ARRAY['Lifelike facial expressions', 'Natural conversation', 'Emotional responses', 'Learning capabilities', 'Media interaction'],
    ARRAY['Entertainment', 'Education', 'Research', 'Media and PR'],
    'Hanson Robotics Sophia - AI Social Robot',
    'Sophia by Hanson Robotics is a famous social humanoid robot with lifelike expressions and advanced conversational AI capabilities.',
    false,
    true
);

-- ============================================================================
-- SEED ROBOT CATEGORY MAPPINGS
-- ============================================================================

-- Tesla Optimus categories
INSERT INTO robot_category_mappings (robot_id, category_id, is_primary) VALUES
((SELECT id FROM robots WHERE slug = 'tesla-optimus-gen2'), (SELECT id FROM robot_categories WHERE slug = 'humanoid-assistants'), true),
((SELECT id FROM robots WHERE slug = 'tesla-optimus-gen2'), (SELECT id FROM robot_categories WHERE slug = 'industrial-humanoids'), false),
((SELECT id FROM robots WHERE slug = 'tesla-optimus-gen2'), (SELECT id FROM robot_categories WHERE slug = 'prototype-robots'), false);

-- Boston Dynamics Atlas categories
INSERT INTO robot_category_mappings (robot_id, category_id, is_primary) VALUES
((SELECT id FROM robots WHERE slug = 'boston-dynamics-atlas-electric'), (SELECT id FROM robot_categories WHERE slug = 'research-platforms'), true),
((SELECT id FROM robots WHERE slug = 'boston-dynamics-atlas-electric'), (SELECT id FROM robot_categories WHERE slug = 'industrial-humanoids'), false);

-- Figure 01 categories
INSERT INTO robot_category_mappings (robot_id, category_id, is_primary) VALUES
((SELECT id FROM robots WHERE slug = 'figure-ai-figure-01'), (SELECT id FROM robot_categories WHERE slug = 'industrial-humanoids'), true),
((SELECT id FROM robots WHERE slug = 'figure-ai-figure-01'), (SELECT id FROM robot_categories WHERE slug = 'humanoid-assistants'), false);

-- Honda ASIMO categories
INSERT INTO robot_category_mappings (robot_id, category_id, is_primary) VALUES
((SELECT id FROM robots WHERE slug = 'honda-asimo-final'), (SELECT id FROM robot_categories WHERE slug = 'research-platforms'), true),
((SELECT id FROM robots WHERE slug = 'honda-asimo-final'), (SELECT id FROM robot_categories WHERE slug = 'entertainment-robots'), false);

-- SoftBank Pepper categories
INSERT INTO robot_category_mappings (robot_id, category_id, is_primary) VALUES
((SELECT id FROM robots WHERE slug = 'softbank-pepper'), (SELECT id FROM robot_categories WHERE slug = 'service-robots'), true),
((SELECT id FROM robots WHERE slug = 'softbank-pepper'), (SELECT id FROM robot_categories WHERE slug = 'entertainment-robots'), false);

-- Hanson Robotics Sophia categories
INSERT INTO robot_category_mappings (robot_id, category_id, is_primary) VALUES
((SELECT id FROM robots WHERE slug = 'hanson-robotics-sophia'), (SELECT id FROM robot_categories WHERE slug = 'entertainment-robots'), true),
((SELECT id FROM robots WHERE slug = 'hanson-robotics-sophia'), (SELECT id FROM robot_categories WHERE slug = 'research-platforms'), false);

-- ============================================================================
-- SEED ROBOT SPECIFICATIONS (Examples)
-- ============================================================================

-- Tesla Optimus specifications
INSERT INTO robot_specifications (robot_id, category, name, value, unit, description, is_verified, sort_order) VALUES
((SELECT id FROM robots WHERE slug = 'tesla-optimus-gen2'), 'mechanical', 'Hand Degrees of Freedom', '11', 'DOF', 'Each hand has 11 degrees of freedom for precise manipulation', true, 1),
((SELECT id FROM robots WHERE slug = 'tesla-optimus-gen2'), 'mechanical', 'Walking Gait', 'Human-like', null, 'Designed to walk with natural human-like gait patterns', true, 2),
((SELECT id FROM robots WHERE slug = 'tesla-optimus-gen2'), 'electrical', 'Actuators', 'Tesla-designed', null, 'Custom actuators designed specifically for Optimus', true, 3),
((SELECT id FROM robots WHERE slug = 'tesla-optimus-gen2'), 'software', 'Neural Network', 'Tesla FSD', null, 'Uses Tesla Full Self-Driving neural network architecture', true, 4);

-- Boston Dynamics Atlas specifications
INSERT INTO robot_specifications (robot_id, category, name, value, unit, description, is_verified, sort_order) VALUES
((SELECT id FROM robots WHERE slug = 'boston-dynamics-atlas-electric'), 'mechanical', 'Actuation', 'Electric', null, 'Fully electric actuation system (previous versions used hydraulics)', true, 1),
((SELECT id FROM robots WHERE slug = 'boston-dynamics-atlas-electric'), 'mechanical', 'Mobility', 'Dynamic', null, 'Capable of running, jumping, and performing parkour', true, 2),
((SELECT id FROM robots WHERE slug = 'boston-dynamics-atlas-electric'), 'sensors', 'Perception', 'Multi-modal', null, 'Combines cameras, LiDAR, and proprioceptive sensors', true, 3),
((SELECT id FROM robots WHERE slug = 'boston-dynamics-atlas-electric'), 'software', 'Control System', 'Real-time', null, 'Advanced real-time control for dynamic balance', true, 4);

-- Figure 01 specifications
INSERT INTO robot_specifications (robot_id, category, name, value, unit, description, is_verified, sort_order) VALUES
((SELECT id FROM robots WHERE slug = 'figure-ai-figure-01'), 'mechanical', 'Design Focus', 'Commercial', null, 'Designed specifically for commercial and industrial applications', true, 1),
((SELECT id FROM robots WHERE slug = 'figure-ai-figure-01'), 'software', 'AI Integration', 'OpenAI Partnership', null, 'Integrates advanced AI through partnership with OpenAI', true, 2),
((SELECT id FROM robots WHERE slug = 'figure-ai-figure-01'), 'applications', 'Target Market', 'Warehousing', null, 'Primary focus on warehouse and logistics automation', true, 3);

-- ============================================================================
-- UPDATE STATISTICS
-- ============================================================================

-- Update manufacturer robot counts (this would typically be done via triggers)
-- This is just for initial setup

-- Analyze tables for better query planning
ANALYZE manufacturers;
ANALYZE robot_categories;
ANALYZE robots;
ANALYZE robot_category_mappings;
ANALYZE robot_specifications;

-- ============================================================================
-- VERIFICATION QUERIES (Comments for reference)
-- ============================================================================

/*
-- Verify the seed data was inserted correctly:

-- Check manufacturers
SELECT name, slug, country, founded_year FROM manufacturers ORDER BY name;

-- Check categories
SELECT name, slug, description FROM robot_categories ORDER BY sort_order;

-- Check robots with their manufacturers
SELECT r.name, r.version, m.name as manufacturer, r.status, r.is_featured
FROM robots r
JOIN manufacturers m ON r.manufacturer_id = m.id
ORDER BY r.name;

-- Check robot categories
SELECT r.name, r.version, c.name as category, rcm.is_primary
FROM robots r
JOIN robot_category_mappings rcm ON r.id = rcm.robot_id
JOIN robot_categories c ON rcm.category_id = c.id
ORDER BY r.name, rcm.is_primary DESC;

-- Check specifications
SELECT r.name, rs.category, rs.name as spec_name, rs.value, rs.unit
FROM robots r
JOIN robot_specifications rs ON r.id = rs.robot_id
ORDER BY r.name, rs.category, rs.sort_order;
*/
