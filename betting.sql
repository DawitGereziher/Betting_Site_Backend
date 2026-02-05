-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 05, 2026 at 09:10 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `betting`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `lastActivityAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`, `isActive`, `lastActivityAt`, `createdAt`) VALUES
('57ab9360-8784-4568-aab2-221bb0295523', 'admin', '$2b$10$10mGTPzJ6b7fFnTOfyN7GOQqfhGd1t9.UBaSNOXYzMme23CvlJCKC', 1, '2026-02-05 11:01:10.655', '2026-02-05 10:48:47.839');

-- --------------------------------------------------------

--
-- Table structure for table `bet`
--

CREATE TABLE `bet` (
  `id` varchar(191) NOT NULL,
  `reference` varchar(191) NOT NULL,
  `cashierId` varchar(191) DEFAULT NULL,
  `amount` double NOT NULL,
  `totalOdds` double NOT NULL,
  `status` enum('PENDING_PAYMENT','CONFIRMED','CANCELLED','WON','LOST','PAID') NOT NULL DEFAULT 'PENDING_PAYMENT',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `confirmedAt` datetime(3) DEFAULT NULL,
  `confirmationReference` varchar(191) DEFAULT NULL,
  `cancelledAt` datetime(3) DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `payoutAmount` double DEFAULT NULL,
  `paidByUserId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bet`
--

INSERT INTO `bet` (`id`, `reference`, `cashierId`, `amount`, `totalOdds`, `status`, `createdAt`, `confirmedAt`, `confirmationReference`, `cancelledAt`, `paidAt`, `payoutAmount`, `paidByUserId`) VALUES
('04a08bf3-58c5-4191-8cb5-19fae02b46df', '88201318', NULL, 20, 540.9980465014125, 'PENDING_PAYMENT', '2026-02-05 16:48:21.325', NULL, NULL, NULL, NULL, NULL, NULL),
('1a2d4525-2778-4769-8c43-ea5243aa9e09', '86228726', NULL, 20, 1619.75463024375, 'PENDING_PAYMENT', '2026-02-05 14:29:55.328', NULL, NULL, NULL, NULL, NULL, NULL),
('28ab455c-ae4d-44e8-ad3e-2222e1f162c8', '53821294', NULL, 20, 525.3321043674, 'PENDING_PAYMENT', '2026-02-05 13:18:09.530', NULL, NULL, NULL, NULL, NULL, NULL),
('30b8a24b-db83-4b0f-b270-5dc2e2750aa6', '14452972', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 540.9980465014125, 'CONFIRMED', '2026-02-05 16:18:53.994', '2026-02-05 16:19:11.037', '462312121504', NULL, NULL, NULL, NULL),
('374f8904-9972-4898-8210-bdbb67824e4c', '55346028', NULL, 20, 28.49187000000001, 'PENDING_PAYMENT', '2026-02-05 15:42:22.713', NULL, NULL, NULL, NULL, NULL, NULL),
('3d2dfeda-e1f7-4ebe-a953-aefde41521aa', '65917993', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 138.717447820875, 'CONFIRMED', '2026-02-05 14:17:53.489', '2026-02-05 14:18:06.233', '439608825338', NULL, NULL, NULL, NULL),
('64a5ae7d-8e15-4ee6-b8b8-4fdf3eb3dbea', '46724574', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 90.56124000000003, 'CONFIRMED', '2026-02-05 13:43:23.440', '2026-02-05 13:48:18.263', '1770299298262072', NULL, NULL, NULL, NULL),
('703ab5ff-90d8-45f6-bba5-407201862648', 'SIM_394158', NULL, 100, 1.268326569913692e26, 'LOST', '2026-02-05 13:45:23.918', '2026-02-05 13:45:23.918', NULL, NULL, NULL, NULL, NULL),
('73919c7a-d66d-4f6d-b594-ab339d8c96b4', '58941844', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 75.828853464, 'CONFIRMED', '2026-02-05 14:41:38.928', '2026-02-05 14:42:03.116', '283322824607', NULL, NULL, NULL, NULL),
('7bed213c-94bf-43ef-a713-6da21fc527f5', '82037758', NULL, 20, 204.198594199871, 'PENDING_PAYMENT', '2026-02-05 11:02:12.947', NULL, NULL, NULL, NULL, NULL, NULL),
('7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', '71782336', NULL, 20, 540.9980465014125, 'PENDING_PAYMENT', '2026-02-05 18:31:35.406', NULL, NULL, NULL, NULL, NULL, NULL),
('7f35f578-309a-4e75-ad5d-69cee622930a', '17768189', NULL, 20, 32.2903746, 'PENDING_PAYMENT', '2026-02-05 13:43:05.611', NULL, NULL, NULL, NULL, NULL, NULL),
('7fff5dae-d4be-4779-88a7-1b3097393ed5', '34925170', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 29.06294737499999, 'CONFIRMED', '2026-02-05 14:07:42.109', '2026-02-05 14:08:42.521', '520147962032', NULL, NULL, NULL, NULL),
('9051e933-7a8b-47d6-ae15-803501e588d4', '60069348', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 29.85675000000001, 'CONFIRMED', '2026-02-05 14:30:46.453', '2026-02-05 14:31:11.562', '668804857891', NULL, NULL, NULL, NULL),
('9abe0c21-c6dd-4d0e-a57b-458e617e5002', '51327078', NULL, 20, 29.85675000000001, 'PENDING_PAYMENT', '2026-02-05 14:48:14.426', NULL, NULL, NULL, NULL, NULL, NULL),
('9d901d85-d5e1-4a49-a9bb-8872789359a8', '64825021', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 190.757952, 'CONFIRMED', '2026-02-05 14:38:01.188', '2026-02-05 14:38:13.452', '643570685890', NULL, NULL, NULL, NULL),
('a9359f48-aa37-4519-8e26-40b80ff62f93', '24811825', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 294.4207055789999, 'CONFIRMED', '2026-02-05 13:48:52.585', '2026-02-05 13:49:04.385', '1770299344385838', NULL, NULL, NULL, NULL),
('aeba9f4d-5ffb-4047-add1-122a408def1f', '78822520', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 415.3217000625, 'CONFIRMED', '2026-02-05 14:22:57.419', '2026-02-05 14:23:08.455', '593025811000', NULL, NULL, NULL, NULL),
('b1d20fae-955d-4287-b2c3-55d9848a0e09', '88490339', '5d481766-f738-4439-be1d-8e41d350a8ba', 20, 540.9980465014125, 'CONFIRMED', '2026-02-05 16:19:33.455', '2026-02-05 16:29:10.331', '596237284138', NULL, NULL, NULL, NULL),
('b4431c62-4ea4-41fe-8abf-daad68e7559e', '72904569', NULL, 20, 294.4207055789999, 'PENDING_PAYMENT', '2026-02-05 14:06:45.846', NULL, NULL, NULL, NULL, NULL, NULL),
('d453e147-42c1-4596-8e80-295c3a42719c', '23347124', NULL, 20, 540.9980465014125, 'PENDING_PAYMENT', '2026-02-05 16:29:23.231', NULL, NULL, NULL, NULL, NULL, NULL),
('ebcda027-5e03-46c9-a84b-db624cb0b87c', '64899524', NULL, 20, 1.2, 'PENDING_PAYMENT', '2026-02-05 15:45:22.389', NULL, NULL, NULL, NULL, NULL, NULL),
('ed875950-30b0-45eb-8ce2-506fc1ddfa85', '42658215', NULL, 20, 540.9980465014125, 'PENDING_PAYMENT', '2026-02-05 16:48:29.305', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `betitem`
--

CREATE TABLE `betitem` (
  `id` varchar(191) NOT NULL,
  `betId` varchar(191) NOT NULL,
  `fixtureId` int(11) NOT NULL,
  `market` varchar(191) NOT NULL,
  `selection` varchar(191) NOT NULL,
  `marketCode` varchar(191) DEFAULT NULL,
  `selectionCode` varchar(191) DEFAULT NULL,
  `line` double DEFAULT NULL,
  `oddValue` double NOT NULL,
  `result` enum('PENDING','WON','LOST','VOID','HALF_WON','HALF_LOST') NOT NULL DEFAULT 'PENDING'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `betitem`
--

INSERT INTO `betitem` (`id`, `betId`, `fixtureId`, `market`, `selection`, `marketCode`, `selectionCode`, `line`, `oddValue`, `result`) VALUES
('0220aa74-749c-487c-bd73-516c20d6b3e1', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('03d37e7c-65f9-4d60-9274-0078286784cc', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('04deb894-7500-464d-8c4a-1899f68c2fcb', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Second Half Exact Goals Number', '4', 'SECOND_HALF_EXACT_GOALS', 'EXACTLY', 4, 5.5, 'LOST'),
('05cca99b-0c9f-40d0-b46d-9627340e146f', '9d901d85-d5e1-4a49-a9bb-8872789359a8', 1386919, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.2, 'PENDING'),
('071fdc37-c7c0-4682-8401-a291722d12b1', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Exact Score', '5:1', 'EXACT_SCORE', '5:1', NULL, 33.5, 'LOST'),
('08467333-f62a-4871-ab9c-22b27889959e', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('087224ee-7f4d-429d-8cc0-4776c65f394b', '7f35f578-309a-4e75-ad5d-69cee622930a', 1491737, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.7, 'PENDING'),
('09930d8f-47ad-417a-a563-ff3dec8902bc', 'd453e147-42c1-4596-8e80-295c3a42719c', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('09f1d2eb-b38b-4d32-83f1-d4e86eee7227', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Team To Score Last', 'Away', 'TEAM_TO_SCORE_LAST', 'AWAY', NULL, 1.3, 'WON'),
('0c4a899a-be74-4cbf-a8bc-e606f77d73df', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('0fac5de8-01ef-4664-8367-10285208869a', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Highest Scoring Half', 'Draw', 'HIGHEST_SCORING_HALF', 'Draw', NULL, 4, 'LOST'),
('105468fb-6020-4f43-9b08-59ff067d1466', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Away Odd/Even', 'Even', 'AWAY_TEAM_ODD_EVEN', 'Even', NULL, 1.83, 'LOST'),
('10833b12-da6a-4572-8220-b19880e96a65', '9abe0c21-c6dd-4d0e-a57b-458e617e5002', 1494404, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.1, 'PENDING'),
('11767cc4-f948-4b72-9f2a-2bc660d1fc9e', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('1196f55c-cf72-40bf-ab32-335b85218785', 'aeba9f4d-5ffb-4047-add1-122a408def1f', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('130d4b1f-999a-40c6-b489-25328bcbf662', 'ebcda027-5e03-46c9-a84b-db624cb0b87c', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('13e8f9a6-f06e-40d8-aac8-57c391bea81d', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('1540829c-5ba2-4b6a-809e-2a43fa645f73', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1489254, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.2, 'PENDING'),
('15da7235-3aca-427a-a034-1d529f15204d', 'aeba9f4d-5ffb-4047-add1-122a408def1f', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('1922ceda-84f7-4c5d-8a37-bc5af5a5d619', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('192c2a73-f8cf-4dfe-a967-6dfbf65484f0', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('19e09455-65f9-4c9d-9faa-feceb062c783', '7f35f578-309a-4e75-ad5d-69cee622930a', 1379219, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.9, 'PENDING'),
('1ad9c051-498e-448c-acbc-9e9eccdcbeed', '73919c7a-d66d-4f6d-b594-ab339d8c96b4', 1386911, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.3, 'PENDING'),
('1b2eb4dc-f08c-460f-998c-e3f46969999c', '7f35f578-309a-4e75-ad5d-69cee622930a', 1379226, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.62, 'PENDING'),
('1cb906e5-61c5-45c3-aa53-79e57f325dd8', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('1d626fb7-f215-4507-95c4-a6d967882e1e', '9d901d85-d5e1-4a49-a9bb-8872789359a8', 1380561, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2, 'PENDING'),
('1d702a4e-ea54-42b8-a792-599e58171168', '374f8904-9972-4898-8210-bdbb67824e4c', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('1e599d9d-df66-4f2c-9af9-2b67f723450e', 'aeba9f4d-5ffb-4047-add1-122a408def1f', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('1f8af7a2-e9a2-43ea-801f-6f405bb36aa9', '374f8904-9972-4898-8210-bdbb67824e4c', 1506883, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.35, 'PENDING'),
('1fe4c4ff-7cc1-4940-a71b-87c830e3b4fe', '73919c7a-d66d-4f6d-b594-ab339d8c96b4', 1379215, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.38, 'PENDING'),
('24e480e6-06d3-494a-940f-48c54f1dab1c', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('25ed4c02-804c-4334-9266-f63898dc4bbc', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Total - Away', 'Under 4.5', 'AWAY_TEAM_TOTAL', 'UNDER', NULL, 1.08, 'WON'),
('263f803f-a43d-4132-b8ba-e04e83e1dcef', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING'),
('26502d23-fd85-4ebc-a1e3-831069306cea', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Home Team Exact Goals Number', '0', 'HOME_TEAM_EXACT_GOALS', 'EXACTLY', 0, 1.91, 'WON'),
('282a0ac4-2294-4548-89a0-83685008b746', '73919c7a-d66d-4f6d-b594-ab339d8c96b4', 1379211, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2, 'PENDING'),
('282e871a-cf6c-4aff-9d9f-3e67dbc7f43d', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1379219, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.9, 'PENDING'),
('29d3aa45-bf8d-48f8-851d-f205793b29a5', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('2aa5bd6f-81bb-4d30-b64f-bc44a6cd9d52', '73919c7a-d66d-4f6d-b594-ab339d8c96b4', 1417280, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('2db31149-68ae-406a-8fb3-d0fefdc5e623', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('2f0dc155-c38d-4647-b551-934b082cc0e5', 'd453e147-42c1-4596-8e80-295c3a42719c', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('2f54c0ca-f727-4e49-9083-e48c6c4363eb', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('2f7a9a93-f69c-4926-9b34-4aec29b7a019', '3d2dfeda-e1f7-4ebe-a953-aefde41521aa', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('3003e681-bc2b-4300-815a-62d510f68998', 'd453e147-42c1-4596-8e80-295c3a42719c', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('32a076fe-b032-474a-9dff-011b2209a166', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1379218, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 5, 'PENDING'),
('34ee872a-6169-49b0-bc56-19ca78387c7c', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('35394723-f2e0-4f72-885f-a400edbd510c', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1379226, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.62, 'PENDING'),
('353f2d59-d7ee-4c7e-a6ba-980d171c7964', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('35b48677-fa41-4a3c-bee1-1c42bdc322a1', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('36f36edc-8c61-44db-9d25-385a521facff', '73919c7a-d66d-4f6d-b594-ab339d8c96b4', 1417281, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.91, 'PENDING'),
('36f439c6-c200-417b-97af-ff0ca4a2f8d1', 'd453e147-42c1-4596-8e80-295c3a42719c', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('37fa7483-f1e5-438b-9b68-8a3310ba51a8', '7fff5dae-d4be-4779-88a7-1b3097393ed5', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('38477ef3-1c52-4c03-bb63-e752ca5fb5f1', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('384787dd-c4f0-4ca4-9bd9-1a5f471077e4', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1489254, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.2, 'PENDING'),
('3880f8a4-0b9b-4920-b8bb-55da66a2b198', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('38e86da6-e3d1-488d-a8eb-6ef8594d14b6', '703ab5ff-90d8-45f6-bba5-407201862648', 1491677, 'To Qualify', 'Away', 'QUALIFICATION_WINNER', 'Away', NULL, 1.7, 'LOST'),
('39936046-b037-4262-a9fc-dd79b89d80b7', 'aeba9f4d-5ffb-4047-add1-122a408def1f', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('3b175ff0-d9fc-4b7d-95e4-b9ec0029742f', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Corners Over Under', 'Over 8.5', 'TOTAL_CORNERS', 'OVER', 8.5, 1.83, 'LOST'),
('3b90e0e2-ea5d-418a-8440-b0c5d2833b06', '64a5ae7d-8e15-4ee6-b8b8-4fdf3eb3dbea', 1509773, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.1, 'PENDING'),
('3bb19a95-b4cf-46b3-86a1-f883e11c8e8b', 'd453e147-42c1-4596-8e80-295c3a42719c', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('3beb5a32-922c-446f-8076-a3d756010609', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1506883, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.9, 'PENDING'),
('3eee4173-41fa-4cb1-9645-71d06af5724c', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('3ef45398-2b03-4812-9e10-241e473cd07a', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('4044800c-9581-41c6-9024-0ccd30b043a3', '9d901d85-d5e1-4a49-a9bb-8872789359a8', 1389309, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.55, 'PENDING'),
('414a13bc-ed9d-4bed-abdd-3db9734e5bb5', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'First Half Winner', 'Draw', 'FIRST_HALF_WINNER', 'DRAW', NULL, 2.05, 'LOST'),
('415f1dad-2f86-49ca-9cb4-791526378105', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('41d34dc9-d679-4667-97b8-136d7e166a3a', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Home/Away', 'Away', 'DRAW_NO_BET', 'Away', NULL, 2.75, 'WON'),
('4234db98-537f-4d6a-a008-2757212a3f1b', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('4795b26c-17d1-4c61-81fe-672aeeb3ba27', '9abe0c21-c6dd-4d0e-a57b-458e617e5002', 1489340, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.1, 'PENDING'),
('48390f59-caf6-434d-842e-f5006f12c89d', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('4a7c74c7-3fc2-4ee3-8393-6f704fb99b54', 'd453e147-42c1-4596-8e80-295c3a42719c', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('4ab7d8c2-0b05-4ca0-8598-1c6045dc760a', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('4b3bd7ba-1c89-4455-8d90-fcb7595ed123', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Win To Nil', 'Away', 'WIN_TO_NIL', 'Away', NULL, 2.1, 'WON'),
('4c569c16-f92d-48aa-a7e1-893c3b1c117a', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Odd/Even - First Half', 'Even', 'FIRST_HALF_ODD_EVEN', 'Even', NULL, 1.67, 'LOST'),
('4d5181c2-e84e-4bc5-a992-f785b8d97c61', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Asian Handicap', 'Away -0.5', 'ASIAN_HANDICAP', 'AWAY', -0.5, 1.85, 'WON'),
('4db8c35b-49fc-4015-b179-983501322e57', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('4e77b4f5-c04f-4249-97d3-794fa1972748', '7f35f578-309a-4e75-ad5d-69cee622930a', 1494515, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.7, 'PENDING'),
('4eac1764-5b18-4569-a53a-abd18eba6e74', '9d901d85-d5e1-4a49-a9bb-8872789359a8', 1396422, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.4, 'PENDING'),
('4f88a4f4-2acf-4755-9584-502dacc3f7ca', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('5018e936-9b5b-44aa-bcc1-54afd9b6cbaf', '9051e933-7a8b-47d6-ae15-803501e588d4', 1386356, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.2, 'PENDING'),
('514e7040-2637-48e1-b7b0-25f06bcdae8f', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1509055, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.45, 'PENDING'),
('560f965c-0408-4548-92bb-24826a308058', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Both Teams Score', 'No', 'BTTS', 'NO', NULL, 1.73, 'WON'),
('57368ea8-bf47-4323-9c70-67a6deb7ab54', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1494515, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.7, 'PENDING'),
('575a0ad0-cc2f-4d7d-ae96-c5076c3e5a30', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Total - Home', 'Under 0.5', 'HOME_TEAM_TOTAL', 'UNDER', NULL, 1.91, 'WON'),
('58ad3cf0-8d8f-42cb-a5c4-94dc6ebe1f91', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Handicap Result', 'Draw +3', 'EUROPEAN_HANDICAP', 'DRAW', 3, 5, 'WON'),
('5a426068-45bd-44f3-a1f4-2453a1bb2bde', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Asian Handicap First Half', 'Away +0', 'ASIAN_HANDICAP_FIRST_HALF', 'Away +0', 0, 2.15, 'WON'),
('5f9ee059-1f24-4614-8f2c-2803a5eab89c', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('5fbdbd6a-24ce-4048-9d16-0e8553457983', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1386913, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.2, 'PENDING'),
('60f258b6-ada1-4dec-a80a-37c1939d9779', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING'),
('6147402f-cc00-4b30-9ea4-ea55ec5ecde0', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('624322c4-07d4-4d43-9022-bacb7387556b', '9051e933-7a8b-47d6-ae15-803501e588d4', 1506883, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.35, 'PENDING'),
('62a4ae3b-914b-45a9-8454-6563d3c99ebe', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('646b0309-9cc0-4502-90f1-86833046f015', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1386913, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.2, 'PENDING'),
('64c6bd48-2e90-4d64-bfd1-509636f788b4', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('654c117e-d855-48a7-b7ca-6690468a83cc', '73919c7a-d66d-4f6d-b594-ab339d8c96b4', 1417284, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.36, 'PENDING'),
('66020ed0-f148-4512-8146-6e8950021335', '73919c7a-d66d-4f6d-b594-ab339d8c96b4', 1417283, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.55, 'PENDING'),
('663aa1c0-490a-4c1f-a11d-22482a7b99d1', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Total Corners (1st Half)', 'Under 4', 'CORNER_TOTAL_FIRST_HALF', 'UNDER', 4, 1.82, 'WON'),
('66f660e2-f7a8-4fda-9af8-81b0c1842657', '3d2dfeda-e1f7-4ebe-a953-aefde41521aa', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('67228022-9303-48b0-b52c-36f16f83c727', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('6828d16e-2ba3-4628-9906-0c0c41803cf5', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1379219, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.9, 'PENDING'),
('69a4c239-7b48-4b02-8456-f6ef83ae50c8', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Correct Score - First Half', '0:1', 'CORRECT_SCORE_FIRST_HALF', '0:1', NULL, 6, 'WON'),
('6c3767d6-16a6-4450-8a55-478d346dfd2a', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Clean Sheet - Away', 'Yes', 'CLEAN_SHEET_AWAY', 'YES', NULL, 2, 'WON'),
('6cd15ea7-f58a-412c-87b7-9307209ba4a9', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'HT/FT Double', 'Draw/Away', 'HALF_TIME_FULL_TIME', 'Draw/Away', NULL, 8, 'LOST'),
('6d3dc3fd-7bbe-41fe-904a-5ca9c647814d', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Double Chance - First Half', 'Home/Draw', 'FIRST_HALF_DOUBLE_CHANCE', 'Home/Draw', NULL, 1.2, 'LOST'),
('6d8fe8bf-1b28-4562-9990-e5cd54282d06', '703ab5ff-90d8-45f6-bba5-407201862648', 1491677, 'Total Goals/Both Teams To Score', 'u/no 2.5', 'TOTAL_GOALS_BTTS', 'EXACTLY', 2.5, 4.5, 'LOST'),
('6de5a313-0b45-4fcd-912b-f9719753c3a7', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1382816, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.12, 'PENDING'),
('6e12a393-474e-4576-822f-7057de9f76c6', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'To Score In Both Halves By Teams', 'Away', 'BTTS_BOTH_HALVES', 'Away', NULL, 1.83, 'LOST'),
('6e57378e-5398-4ae7-afb5-22d7cc54c923', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('70bebc56-f4ad-41e7-87ce-5fcc4e45203a', '7fff5dae-d4be-4779-88a7-1b3097393ed5', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('72fea937-9ccd-4539-bcad-5a6bda3191c5', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'To Win Either Half', 'Home', 'TO_WIN_EITHER_HALF', 'HOME', NULL, 4.33, 'LOST'),
('73689b92-3b1f-4aea-a058-96578d6e9f7c', '7f35f578-309a-4e75-ad5d-69cee622930a', 1379225, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('73906307-f98b-4461-bbf2-5b083a6b667b', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Home Odd/Even', 'Odd', 'HOME_TEAM_ODD_EVEN', 'Odd', NULL, 2.38, 'LOST'),
('74da839c-c6cf-4979-ba7e-f0f513ef9b03', '7fff5dae-d4be-4779-88a7-1b3097393ed5', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('7580e84f-60a6-4175-8c56-56e80e927842', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Odd/Even', 'Odd', 'MATCH_GOALS_ODD_EVEN', 'Odd', NULL, 2, 'WON'),
('763cdfa1-be36-449a-bd14-4d7ba273db92', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('7717648e-18fb-4fa4-9d70-86641163182e', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1509055, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.55, 'PENDING'),
('79787d27-666e-4e88-a028-dc62ccfed3cf', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('7c17160b-33a1-4854-a5da-cd33e9486d93', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('7c26c517-13bc-4aa4-91d1-29535e54df4e', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('7cc5f8a9-3f6a-48d1-b7ac-6d237aa319b1', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('7dc5a0b1-b607-4e24-8a8c-8a825281a91c', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Double Chance', 'Draw/Away', 'DOUBLE_CHANCE', 'X2', NULL, 1.8, 'WON'),
('81b1d567-2293-4626-b495-d3a2572022cc', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Exact Goals Number - First Half', '4', 'FIRST_HALF_EXACT_GOALS', 'EXACTLY', 4, 8.5, 'LOST'),
('81c06326-8ae3-4d48-a9b0-8154859a4160', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('82a4ecb0-f118-4e09-92db-180d11532585', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Win Both Halves', 'Home', 'TO_WIN_BOTH_HALVES', 'Home', NULL, 20.5, 'LOST'),
('83111e59-f7f9-4728-a547-c5cd88c8d87e', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('836220da-5dfa-44ee-8c7c-0a354a1c50d1', '9051e933-7a8b-47d6-ae15-803501e588d4', 1494404, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.1, 'PENDING'),
('83aedd2e-1770-40bb-9411-db520b7a5ef9', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1379216, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('84ab0dd7-43f1-4ab7-883b-86d6ad4d5dcd', '703ab5ff-90d8-45f6-bba5-407201862648', 1514128, 'Total Goals/Both Teams To Score', 'o/yes 2.5', 'TOTAL_GOALS_BTTS', 'EXACTLY', 2.5, 2.4, 'WON'),
('874234e6-c057-40ce-a4fe-9923731a7d3e', '9d901d85-d5e1-4a49-a9bb-8872789359a8', 1398156, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.3, 'PENDING'),
('87aacabe-8f9a-4587-8de5-d1c16ea5aad9', '3d2dfeda-e1f7-4ebe-a953-aefde41521aa', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('8aea25a4-bf8f-4003-8e39-78cf515daf00', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1382818, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.7, 'PENDING'),
('8e22d069-2c3f-4f2a-9959-89e8f95971e2', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('8ea58495-4651-42cd-afd5-7c9eedec78f4', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Clean Sheet - Home', 'Yes', 'CLEAN_SHEET_HOME', 'YES', NULL, 7.5, 'LOST'),
('8f761a78-d7fd-4a5a-a381-76c683edaf29', '703ab5ff-90d8-45f6-bba5-407201862648', 1510236, 'Results/Both Teams Score', 'Home/No', 'RESULT_BTTS', 'Home/No', NULL, 3.25, 'LOST'),
('91b4bad8-0aa3-4031-8fea-b9085c651f81', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('91bafdb4-5aa1-4995-ba44-91337699cfa0', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('91d9b2bf-9332-41ca-b7fe-f433ae9cc980', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('9523e458-3644-478b-9602-be159ad6d45c', 'd453e147-42c1-4596-8e80-295c3a42719c', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('9563bcf0-53b9-412e-8e00-a8fb4fd37e95', '703ab5ff-90d8-45f6-bba5-407201862648', 1510236, 'Total Goals/Both Teams To Score', 'o/yes 2.5', 'TOTAL_GOALS_BTTS', 'EXACTLY', 2.5, 3.75, 'WON'),
('968a1646-b779-4853-9f43-95f3f5c85ab6', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('97070c36-6bb4-4ffa-a73c-3ba0e2fb0aae', '703ab5ff-90d8-45f6-bba5-407201862648', 1510236, 'First 10 min Winner', 'Draw', 'FIRST_10_MIN_WINNER', 'Draw', NULL, 1.09, 'WON'),
('975e92d1-4c65-4bcf-9c16-179571cb10af', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('9a747be8-7494-4c29-8b9e-63f73072b594', '9051e933-7a8b-47d6-ae15-803501e588d4', 1489093, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.5, 'PENDING'),
('9ac0823b-9464-4868-b00d-c87e444f0a48', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('9c79dc31-5d97-41ee-aee9-0c1b28483870', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Odd/Even - Second Half', 'Even', 'SECOND_HALF_ODD_EVEN', 'Even', NULL, 1.73, 'WON'),
('9dcf0069-11a1-4964-87a3-4d8a39d2cec5', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('9e8e2593-97c2-466e-91d3-6b3ccdae0e1c', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('a4a93ce6-c788-42f9-bfba-d2a674d7e83b', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Results/Both Teams Score', 'Away/Yes', 'RESULT_BTTS', 'Away/Yes', NULL, 3, 'LOST'),
('a8667bb4-5f1d-4f54-a6e4-39164d9debe2', '3d2dfeda-e1f7-4ebe-a953-aefde41521aa', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('aaa58237-d141-4ea9-a383-b7b11596d215', '374f8904-9972-4898-8210-bdbb67824e4c', 1489093, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.5, 'PENDING'),
('ae7e4f4e-f53a-4fe4-b2a1-b0d31a8b19ce', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('b0a55549-46a8-4991-9240-29b3d4366f5a', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('b3727e99-e207-4d8a-a49e-d05b8cc10b9b', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1379225, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('b3a09ec1-be71-404f-bf3b-d6d70975b3d5', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1379225, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.65, 'PENDING'),
('b3a1d7f5-9037-45c0-846f-485853127d2d', 'd453e147-42c1-4596-8e80-295c3a42719c', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('b3e23800-4c49-4f09-b1c8-1ba8ff413d32', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1379224, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.38, 'PENDING'),
('b411331d-ffb7-406f-a072-c921da957f51', '9abe0c21-c6dd-4d0e-a57b-458e617e5002', 1489093, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.5, 'PENDING'),
('b5f139f6-a89d-4d4b-9333-646bf057bd85', '3d2dfeda-e1f7-4ebe-a953-aefde41521aa', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('b5f37203-34b5-41ee-9ae8-4d3b6ba1a8fd', 'aeba9f4d-5ffb-4047-add1-122a408def1f', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('b63fcbb2-9ff4-4608-a7c8-9c8132d7061e', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Winning Margin', '2 by 3', 'WINNING_MARGIN', '2 by 3', NULL, 5.5, 'WON'),
('b716aead-1585-45bf-b68b-e6f6efd7a95e', 'aeba9f4d-5ffb-4047-add1-122a408def1f', 1379218, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 5, 'PENDING'),
('b84c83b6-00f9-452c-925d-b5d8e8724201', '9051e933-7a8b-47d6-ae15-803501e588d4', 1489340, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.1, 'PENDING'),
('b97a113d-17a1-4049-aa89-9db905728cac', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING'),
('bb0516db-23cc-474f-8e5b-02f5b0f4745c', '64a5ae7d-8e15-4ee6-b8b8-4fdf3eb3dbea', 1509055, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.7, 'PENDING'),
('bc3bb288-4c78-4e42-b2d1-19cef29c2a2f', '64a5ae7d-8e15-4ee6-b8b8-4fdf3eb3dbea', 1386356, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.2, 'PENDING'),
('bcffbcaa-8f8b-4b8f-b744-cf86920e1481', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('bf9be622-def8-4bca-afec-1b5ac78eb7e4', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Both Teams Score - First Half', 'Yes', 'BTTS_FIRST_HALF', 'Yes', NULL, 5, 'LOST'),
('c09a2c18-18d8-4660-aa14-ae3d3cd644e2', '703ab5ff-90d8-45f6-bba5-407201862648', 1491677, 'Results/Both Teams Score', 'Away/No', 'RESULT_BTTS', 'Away/No', NULL, 5.5, 'LOST'),
('c148842a-00cd-48cc-a1af-20c6985b1ff8', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING'),
('c16f449a-8492-4d8f-b3f2-79c090b3d8f9', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('c17daecf-714a-49ab-9bfe-5e4d3f600e7d', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('c2efdb16-3aa3-4cea-966e-e8e14069183c', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('c3f56a39-eb8c-49e9-85f4-a80ef4bd8dd1', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1491737, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.7, 'PENDING'),
('c61a2888-96eb-474e-bc48-16819ef2a8d7', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('c70a93f4-53fa-4789-815b-8a890fbd99f9', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Second Half Winner', 'Draw', 'SECOND_HALF_WINNER', 'DRAW', NULL, 3.1, 'LOST'),
('c7f391b4-397d-48c5-858e-08877b2a4e0a', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('c9262618-66b3-477b-9890-2c786109fd31', '374f8904-9972-4898-8210-bdbb67824e4c', 1494404, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.1, 'PENDING'),
('caa06a09-f6a2-40c4-a967-fb43b6b73692', '64a5ae7d-8e15-4ee6-b8b8-4fdf3eb3dbea', 1506883, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.4, 'PENDING'),
('caeae900-5ed3-455d-82b7-ef8276509cc0', '374f8904-9972-4898-8210-bdbb67824e4c', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('cb10da84-fd78-4880-b7d5-d09967d982b4', '9d901d85-d5e1-4a49-a9bb-8872789359a8', 1396423, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.2, 'PENDING'),
('cbd8907c-bc4f-4c49-8624-de6809ef737a', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Handicap Result - First Half', 'Draw +1', 'EUROPEAN_HANDICAP_FIRST_HALF', 'Draw +1', 1, 2.88, 'LOST'),
('cbdf2110-f8fb-43c2-af50-633bc2e1604f', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('ccc85006-ff0c-48a9-888c-967e7a63559d', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('ccd3948e-5518-4330-b0bc-95fa171f3730', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1386356, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.2, 'PENDING'),
('ce6a7027-b5af-4e01-b013-6442c1990463', 'b1d20fae-955d-4287-b2c3-55d9848a0e09', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('cf2212ad-91e0-425c-ac9a-28feb6b2a92f', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Goals Over/Under', 'Over 2.5', 'TOTAL_GOALS', 'OVER', 2.5, 2.25, 'LOST'),
('d0f25209-10d7-456a-865f-874d59dd8fce', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.9, 'LOST'),
('d14f1542-21a4-4617-b601-32ad0a2db738', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Goal Line (1st Half)', 'Under 0.75', 'FIRST_HALF_GOALS', 'UNDER', 0.75, 2.1, 'LOST'),
('d1d4a32a-9efd-4af5-9817-4a367a43c6ac', '3d2dfeda-e1f7-4ebe-a953-aefde41521aa', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('d30fa194-900b-4da7-ad24-427aeb04d3af', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('d6786ef6-6687-4a86-9006-90ebd6a2e2f9', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1379226, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.62, 'PENDING'),
('d70678ba-4dd4-4c71-8719-4cf1fe37a373', '3d2dfeda-e1f7-4ebe-a953-aefde41521aa', 1379209, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.2, 'PENDING'),
('dcb619b3-0cd4-418d-8573-4b5c33eed69d', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('dff9003b-2dc5-4a4d-84a0-1287976aaa83', '7bed213c-94bf-43ef-a713-6da21fc527f5', 1379222, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.67, 'PENDING'),
('e0f34292-0b57-4230-9ab8-f8ad916a9dd4', '9d901d85-d5e1-4a49-a9bb-8872789359a8', 1382173, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.4, 'PENDING'),
('e3e6c257-97c1-4dfe-9f3b-c445d61fa0b0', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'RTG_H1', 'Draw/Under 1.5', 'RESULT_TOTAL_GOALS_FIRST_HALF', 'UNDER', NULL, 3.75, 'WON'),
('e40a7015-17cf-4c98-bb20-39630d559a61', '7f35f578-309a-4e75-ad5d-69cee622930a', 1489254, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.2, 'PENDING'),
('e658a660-ce10-4f8a-b8f1-501178b07f39', 'aeba9f4d-5ffb-4047-add1-122a408def1f', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('e6909a60-17b8-4b15-a3b9-f7e0333b349e', '3d2dfeda-e1f7-4ebe-a953-aefde41521aa', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('e8b0a5d1-cede-4783-8a51-25b4692b62c6', '703ab5ff-90d8-45f6-bba5-407201862648', 1514128, 'Results/Both Teams Score', 'Draw/Yes', 'RESULT_BTTS', 'Draw/Yes', NULL, 4.75, 'LOST'),
('e9c56aaf-b77d-490b-909a-153668f2fa1f', '703ab5ff-90d8-45f6-bba5-407201862648', 1501049, 'Team To Score First', 'Away', 'TEAM_TO_SCORE_FIRST', 'AWAY', NULL, 2.6, 'WON'),
('e9da9b13-64d4-412f-b60a-6d7a865e14c2', '7fff5dae-d4be-4779-88a7-1b3097393ed5', 1379217, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.05, 'PENDING'),
('ed314427-ca4b-4dc9-b4c5-dea535eea110', '7fff5dae-d4be-4779-88a7-1b3097393ed5', 1379218, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 1.67, 'PENDING'),
('ed905764-c8a4-466d-94ad-892204ed1983', '28ab455c-ae4d-44e8-ad3e-2222e1f162c8', 1491737, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.7, 'PENDING'),
('edb28165-4c89-4835-935b-faf3dd5a8faf', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Total Goals/Both Teams To Score', 'u/yes 2.5', 'TOTAL_GOALS_BTTS', 'EXACTLY', 2.5, 6, 'LOST'),
('edbdd4cc-d22f-4828-8700-734658c141a4', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING'),
('edd0bb78-0df2-4b24-a8aa-e0c4d2390789', '7c87c55b-963f-4c06-a8c6-1d0b6a2b00eb', 1379210, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.45, 'PENDING'),
('f08aa6f3-1e5c-4f8f-b390-3c42a3a0a04a', '9abe0c21-c6dd-4d0e-a57b-458e617e5002', 1386356, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.2, 'PENDING'),
('f09177f1-aa6d-4779-a3e3-3e0483f4a7a1', '1a2d4525-2778-4769-8c43-ea5243aa9e09', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING'),
('f1f1578c-6e24-405c-9fd6-7c514d0331c2', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Exact Goals Number', '4', 'EXACT_TOTAL_GOALS', 'EXACTLY', 4, 5, 'LOST'),
('f36fea7d-5daa-4792-9f2e-33c9577bdd45', '374f8904-9972-4898-8210-bdbb67824e4c', 1386356, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.2, 'PENDING'),
('f4124f0e-c2db-456e-973f-2a5e35f21f7b', '04a08bf3-58c5-4191-8cb5-19fae02b46df', 1386915, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2, 'PENDING'),
('f5ebdb34-b5e8-4c47-a909-beee34e16e53', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Both Teams To Score - Second Half', 'No', 'BTTS_SECOND_HALF', 'No', NULL, 1.25, 'WON'),
('f5f42aee-c234-4450-b82d-88ef3159e070', '30b8a24b-db83-4b0f-b270-5dc2e2750aa6', 1386914, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.85, 'PENDING'),
('f74cc5bb-c809-45b1-9216-feac83c21f70', 'd453e147-42c1-4596-8e80-295c3a42719c', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING'),
('f7c40dfa-10ee-46aa-9a6c-229c8338ee87', '64a5ae7d-8e15-4ee6-b8b8-4fdf3eb3dbea', 1494404, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.1, 'PENDING'),
('f844b156-0409-49c7-8348-e91732636cef', 'aeba9f4d-5ffb-4047-add1-122a408def1f', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('f876c383-d866-4bd6-a4f5-1e5c7be0287c', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Away Team Exact Goals Number', '2', 'AWAY_TEAM_EXACT_GOALS', 'EXACTLY', 2, 3.5, 'LOST'),
('f8c13c53-2f06-4057-923f-8d5fbc22a84f', '64a5ae7d-8e15-4ee6-b8b8-4fdf3eb3dbea', 1489093, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.75, 'PENDING'),
('f96b471a-1fb0-4e90-a2ef-4c7f555ce32f', 'b4431c62-4ea4-41fe-8abf-daad68e7559e', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING'),
('fadf3f5d-ca15-4d3d-b915-922d8fee2537', 'a9359f48-aa37-4519-8e26-40b80ff62f93', 1379213, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.1, 'PENDING'),
('faf9b4f6-65e8-4503-965f-29cefe95f8c2', '703ab5ff-90d8-45f6-bba5-407201862648', 1508718, 'Result/Total Goals', 'Draw/Over 3.5', 'MATCH_WINNER_AND_TOTAL_GOALS', 'OVER', 3.5, 8.5, 'LOST'),
('fdd49b53-a26e-4848-b253-e938428ced83', 'd453e147-42c1-4596-8e80-295c3a42719c', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('fe35425f-30ad-4f8a-9ba5-9eb876821beb', '9abe0c21-c6dd-4d0e-a57b-458e617e5002', 1506883, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 2.35, 'PENDING'),
('fe576c5c-8b53-40fc-9dc4-2611c91c0028', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1379212, 'Match Winner', 'Away', 'MATCH_WINNER', 'AWAY', NULL, 2.15, 'PENDING'),
('ff3b475a-642a-443d-b52e-e0beb934dbd2', 'ed875950-30b0-45eb-8ce2-506fc1ddfa85', 1386921, 'Match Winner', 'Home', 'MATCH_WINNER', 'HOME', NULL, 1.95, 'PENDING');

-- --------------------------------------------------------

--
-- Table structure for table `cashier`
--

CREATE TABLE `cashier` (
  `id` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `balanceLimit` double NOT NULL DEFAULT 0,
  `currentBalance` double NOT NULL DEFAULT 0,
  `fullName` varchar(191) DEFAULT NULL,
  `phoneNumber` varchar(191) DEFAULT NULL,
  `stationName` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `additionalNotes` text DEFAULT NULL,
  `lastActivityAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cashier`
--

INSERT INTO `cashier` (`id`, `username`, `password`, `isActive`, `balanceLimit`, `currentBalance`, `fullName`, `phoneNumber`, `stationName`, `location`, `additionalNotes`, `lastActivityAt`, `createdAt`) VALUES
('25485bae-ec26-46df-a2ff-85faf58d3d8c', 'cashier1', '$2b$10$z9mbBynN8JioKjmaJGf6sOM.ZaNXxfosXBCZJx0xOAYmH7G9wAviu', 1, 10000, 0, 'Sample Cashier One', NULL, 'Main Station', NULL, NULL, '2026-02-05 10:48:47.929', '2026-02-05 10:48:47.929'),
('5d481766-f738-4439-be1d-8e41d350a8ba', 'dave', '$2b$10$YjhvnGOvcoGDKRW10T1Ca.bB6eWhQ6ZMMo6wP7MtdljvjPu9o9tOW', 1, 10000, 200, NULL, NULL, NULL, NULL, NULL, '2026-02-05 16:56:17.664', '2026-02-05 11:01:07.939');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('063b4096-b848-4a26-938f-9e70b6a7a8c7', '736a4c1363089fdd216bc548f82e7e9e22d5a292bed170fa8ce597e7e52e5a5f', '2026-02-05 10:44:36.754', '20260205104436_separate_admin_cashier', NULL, NULL, '2026-02-05 10:44:36.467', 1),
('35e410d6-94ab-42e1-9fe9-c57d40d9fbb2', 'e3831d4f3d0ca9abe946f93d529b4a2007befd6626f165629c427d5955e00c7c', '2026-02-05 10:44:35.295', '20260202204350_add_is_active_to_user', NULL, NULL, '2026-02-05 10:44:34.955', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_username_key` (`username`);

--
-- Indexes for table `bet`
--
ALTER TABLE `bet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bet_reference_key` (`reference`),
  ADD KEY `bet_cashierId_fkey` (`cashierId`),
  ADD KEY `bet_paidByUserId_fkey` (`paidByUserId`);

--
-- Indexes for table `betitem`
--
ALTER TABLE `betitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `betitem_betId_fkey` (`betId`);

--
-- Indexes for table `cashier`
--
ALTER TABLE `cashier`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cashier_username_key` (`username`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bet`
--
ALTER TABLE `bet`
  ADD CONSTRAINT `bet_cashierId_fkey` FOREIGN KEY (`cashierId`) REFERENCES `cashier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bet_paidByUserId_fkey` FOREIGN KEY (`paidByUserId`) REFERENCES `cashier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `betitem`
--
ALTER TABLE `betitem`
  ADD CONSTRAINT `betitem_betId_fkey` FOREIGN KEY (`betId`) REFERENCES `bet` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
