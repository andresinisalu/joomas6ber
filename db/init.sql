drop owned by current_user;

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
CONSTRAINT "id" PRIMARY KEY ("id")
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