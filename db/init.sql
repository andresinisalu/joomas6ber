drop owned by current_user;

DROP SCHEMA IF EXISTS public;

CREATE SCHEMA public;

CREATE TABLE public.users
("firstname" text,
"middlename" text,
"lastname" text,
"service" text,
"gender" text,
"weight" decimal,
"id" serial NOT NULL,
"username" text UNIQUE,
"password" text,
"type" text,
"facebook_id" text,
"ssn" text,
CONSTRAINT "user_id" PRIMARY KEY ("id")
);
ALTER TABLE public.users OWNER to joomas6ber;

INSERT INTO public.users
(firstname, lastname, username, password, type) VALUES
('FirstName', 'SecondName', 'test', '$2a$10$bmlsXID9Dhw4WN5i90HdW.voMdWss.46MNkNladJUACJ43KWvRi66', 'user');

INSERT INTO public.users
(firstname, lastname, username, password, type) VALUES
('AdminFirstName', 'AdminLastName', 'admin', '$2a$10$U0FClYJnGbitv6NgH9/0cuu9hNJedBZvRJGE9fGdfC0Au6kN6t07G', 'admin');

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE TABLE "stats" (
"screen_width" integer,
"screen_height" integer,
"date" text,
"ip_addr" text,
"country_name" text,
"city" text,
"user_agent" text,
"os_name" text,
"browser_name" text,
"endpoint" text
);

CREATE TABLE "drinks" (
"name" text,
"volume" integer,
"alcohol_percentage" decimal,
"price" decimal,
"userid" integer,
"id" serial NOT NULL,
CONSTRAINT "drink_id" PRIMARY KEY ("id")
);

INSERT INTO drinks
(name, volume, alcohol_percentage, price) values
('Õlu', 500, 5.0, 3.5),
('Vein', 170, 12.5, 4.0),
('Viski', 150, 45, 5.0);

CREATE TABLE "consumed_drinks" (
"userid" integer NOT NULL,
"drinkid" integer NOT NULL,
"startdate" text NOT NULL,
"enddate" text,
"isfinished" boolean
)