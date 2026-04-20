

DROP TABLE IF EXISTS owner;
CREATE TABLE `owner` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `account` VARCHAR(20) DEFAULT NULL COMMENT '账号',
    `password_hash` VARCHAR(255) DEFAULT NULL COMMENT '密码哈希值(bcrypt)',
    `user_name` VARCHAR(10) DEFAULT NULL COMMENT '用户姓名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `email` VARCHAR(50) DEFAULT NULL COMMENT '邮箱',
    `age` INT DEFAULT NULL COMMENT '年龄',
    `gender` TINYINT(1) DEFAULT NULL COMMENT '性别: 0: 未设置, 1: 男, 2: 女',
    `is_delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已删除: 0 否, 1 是',
    `create_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `account_unique` (`account`),
    UNIQUE KEY `phone_unique` (`phone`)
) ENGINE = InnoDB AUTO_INCREMENT = 1000000 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '业主表';