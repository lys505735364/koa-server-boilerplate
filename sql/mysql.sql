show databases;	     --查看当前所有的数据库
use 数据库名;	      --打开指定的数据库
show tables;	     --查看所有的表
describe/desc 表名;	  --显示表的信息
create database 数据库名;	--创建一个数据库
exit	--退出连接

-- 1、创建数据库

CREATE DATABASE [IF NOT EXISTS] 数据库名;

-- 2、删除数据库

DROP DATABASE [if EXISTS] 数据库名;

-- 3、使用数据库  如果表名或者字段名是特殊字符，则需要带``

use 数据库名;


-- 4、查看数据库
SHOW DATABASES;

-- 创建库 + 指定编码+排序规则（解决中文乱码、表情符号）
CREATE DATABASE IF NOT EXISTS koa_db DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci;

//-----------新建表
CREATE TABLE IF NOT EXISTS `student`(
	`id` INT(4)	NOT NULL AUTO_INCREMENT COMMENT '学号',
	`name` VARCHAR(30) NOT NULL DEFAULT '匿名' COMMENT '姓名',
	`pwd` VARCHAR(20) NOT NULL DEFAULT MD5('123456') COMMENT '密码',
	`sex` VARCHAR(2) NOT NULL DEFAULT '女' COMMENT '性别',
	`birthday` DATETIME DEFAULT NULL COMMENT '出生日期',
	`address` VARCHAR(100) DEFAULT NULL COMMENT '家庭住址',
	`email` VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
	PRIMARY KEY (`id`)
)ENGINE=INNODB DEFAULT CHARSET=utf8

CREATE TABLE IF NOT EXISTS `student`(
	'字段名' 列类型 [属性] [索引] [注释],
    '字段名' 列类型 [属性] [索引] [注释],
    ......
    '字段名' 列类型 [属性] [索引] [注释]
)[表的类型][字符集设置][注释]


SHOW CREATE DATABASE 数据库名;-- 查看创建数据库的语句
SHOW CREATE TABLE 表名;-- 查看表的定义语句
DESC 表名;-- 显示表的具体结构

-- #########################
-- ##                     ##
-- ##   查看和修改表属性   ##
-- ##                     ##
-- #########################

-- 修改表名
-- ALTER TABLE 旧表名 RENAME AS 新表名
ALTER TABLE teacher RENAME AS teachers;

-- 增加表的字段
-- ALTER TABLE 表名 ADD 字段名 列属性
ALTER TABLE teachers ADD age INT(11);

-- 修改表的字段(重命名，修改约束)
-- ALTER TABLE 表名 MODIFY 字段名 [列属性];
ALTER TABLE teachers MODIFY age VARCHAR(11);-- 修改约束
-- ALTER TABLE 表名 CHANGE 旧名字 新名字 [列属性];
ALTER TABLE teachers CHANGE age age1 INT(1);-- 字段重命名

-- 删除表的字段
-- ALTER TABLE 表名 DROP 字段名
ALTER TABLE teachers DROP age1;


-- #######################
-- ##                   ##
-- ##      插入数据      ##
-- ##                   ##
-- #######################

-- 普通用法
INSERT INTO `student`(`name`) VALUES ('zsr');

-- 插入多条数据
INSERT INTO `student`(`name`,`pwd`,`sex`) VALUES ('zsr','200024','男'),('gcc','000421','女');

-- 省略字段
INSERT INTO `student` VALUES (5,'Bareth','123456','男','2000-02-04','武汉','1412@qq.com',1); 

-- #######################
-- ##                   ##
-- ##      修改数据      ##
-- ##                   ##
-- #######################


-- 修改学员名字,指定条件
UPDATE `student` SET `name`='zsr204' WHERE id=1;

-- 不指定条件的情况,会改动所有表
UPDATE `student` SET `name`='zsr204';

-- 修改多个属性
UPDATE `student` SET `name`='zsr',`address`='湖北' WHERE id=1;

-- 通过多个条件定位数据
UPDATE `student` SET `name`='zsr204' WHERE `name`='zsr' AND `pwd`='200024';