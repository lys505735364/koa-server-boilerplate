
DROP TABLE IF EXISTS house;
CREATE TABLE `house` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `community_id` INT NOT NULL COMMENT '所属小区ID',
    `building` VARCHAR(10) NOT NULL COMMENT '楼栋号',
    `unit` VARCHAR(10) DEFAULT NULL COMMENT '单元号',
    `room_number` VARCHAR(20) NOT NULL COMMENT '房号',
    `area` DECIMAL(10, 2) DEFAULT NULL COMMENT '建筑面积(平方米)',
    `is_delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已删除: 0 否, 1 是',
    `create_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_community_id` (`community_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 10000 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '房产表';

