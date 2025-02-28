create table users (
    user_id int primary key auto_increment,
    username varchar(25) NOT NULL UNIQUE,
    password varchar(255) not null,
    email varchar(50) not null,
    created_at timestamp default current_timestamp,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role enum('admin', 'teacher', 'parent', 'student') not null,
    wa_num varchar(20) not null
);

create table teachers (
    teacher_id int primary key auto_increment,
    teacher_name varchar(50) not null,
    nip varchar(50),
    photo_path varchar(200) not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    foreign key (user_id) references users(user_id) on update cascade on delete cascade
);

create table parents (
    parent_id int primary key auto_increment,
    parent_name varchar(50) not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    foreign key (user_id) references users(user_id) on update cascade on delete cascade
);

create table students (
    student_id int primary key auto_increment,
    nis VARCHAR(50) NOT NULL UNIQUE,
    nisn VARCHAR(50) NOT NULL UNIQUE,
    student_name varchar(50) not null,
    dob date not null,
    pob varchar(50) not null,
    photo_path varchar(200) not null,
    address varchar(200) not null,
    rfid varchar(50) UNIQUE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    parent_id int not null,
    foreign key (user_id) references users(user_id) on update cascade on delete cascade,
    foreign key (parent_id) references parents(parent_id) on update cascade on delete cascade
);

create table attendance_sessions (
    as_id int primary key auto_increment,
    as_name varchar(200) not null,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

create table attendance_subsessions (
    ass_id int primary key auto_increment,
    ass_name varchar(200) not null,
    ass_start_time TIMESTAMP NULL,
    ass_end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    as_id int not null,
    foreign key (as_id) references attendance_sessions(as_id) on update cascade on delete cascade
);

create table student_attendances (
    sa_id int primary key auto_increment,
    sa_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sa_photo_path varchar(200),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ass_id int not null,
    student_id int not null,
    foreign key (ass_id) references attendance_subsessions(ass_id) on update cascade on delete cascade,
    foreign key (student_id) references students(student_id) on update cascade on delete cascade
);
