--
-- Table structure for table admins
--

DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  admin_name varchar(100) NOT NULL,
  email varchar(100) DEFAULT NULL,
  admin_password varchar(30) DEFAULT NULL
);

INSERT INTO admins VALUES (1,'Tony','tony@example.com','t0nyp455');

--
-- Table structure for table contributors
--

DROP TABLE IF EXISTS contributors;
CREATE TABLE contributors (
  id SERIAL PRIMARY KEY,
  contributor_name varchar(120) NOT NULL,
  region varchar(20) NOT NULL,
  email varchar(30) DEFAULT NULL,
  password text NOT NULL
);

--
-- Dumping data for table contributors
--

INSERT INTO contributors VALUES 
  (4,'Tony','UK','tony@example.com','$2b$10$mRSPKDfDtW2K7IuejHn1POeyYcjh/.uE.YmA7tvaRlTVT0y5l9pl6'),
  (5,'John','UK','john@example.com','$2b$10$hNnbCyg92ITxvvkNTeeVeerTEGB..F7/f9sESLhacqGE7p4gYdrDW'),
  (7,'Pete','UK','pete@example.com','$2b$10$iZfO1bNAIgSt4NVsV8FP.OUyD0e.sbUQqPJ/vlIGCTfy1mtNgPoqy');

--
-- Table structure for table terms
--

DROP TABLE IF EXISTS terms;
CREATE TABLE terms (
  id SERIAL PRIMARY KEY,
  term varchar(30) NOT NULL,
  definition text NOT NULL,
  contributor_id INT REFERENCES contributors(id),
  creation_date timestamp DEFAULT CURRENT_TIMESTAMP,
  last_edit_date timestamp
);

--
-- Trigger function to update timestamp
--
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_edit_date = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--
-- Create trigger to update last_edit_date
--

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON terms
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

--
-- Dumping data for table terms
--

INSERT INTO terms VALUES 
  (17,'boolean','A type with two values, true or false used in boolean expressions.',4,'2021-06-11 18:26:47'),
  (18,'variable','A way to store a single value',4,'2021-06-11 19:30:51');

UPDATE terms SET contributor_id = 5 WHERE id = 17;

--
-- Table structure for table term_resources
--

CREATE TYPE link_t AS ENUM ('video', 'web');

DROP TABLE IF EXISTS term_resources;
CREATE TABLE term_resources (
  id SERIAL PRIMARY KEY,
  termid INT REFERENCES terms(id),
  link text NOT NULL,
  linktype link_t NOT NULL,
  language varchar(255) NOT NULL
);

--
-- Dumping data for table term_resources
--

INSERT INTO term_resources VALUES 
  (1,17,'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference','web','javascript'),
  (4,17,'https://www.w3schools.com/js/js_booleans.asp','web','javascript'),
  (5,18,'https://www.w3schools.com/js/js_variables.asp','web','javascript');
