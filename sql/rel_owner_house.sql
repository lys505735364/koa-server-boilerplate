
DROP TABLE IF EXISTS rel_owner_house;
CREATE TABLE `rel_owner_house` (
    `id` INT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `owner_id` INT NOT NULL COMMENT '业主ID',
    `house_id` INT NOT NULL COMMENT '房产ID',
    `is_primary` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否主要房产: 0 否, 1 是',
    `is_delete` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已删除: 0 否, 1 是',
    `create_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_owner_house` (`owner_id`, `house_id`),
    KEY `idx_owner_id` (`owner_id`),
    KEY `idx_house_id` (`house_id`)
) ENGINE = InnoDB AUTO_INCREMENT = 10000 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '业主-房产关系表';

