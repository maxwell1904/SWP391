package com.unleashed.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Integer notificationId;


    @JsonAlias({"title"})
    @JsonView(Views.ListView.class)
    private String notificationTitle;

    @JsonAlias({"message"})
    @JsonView(Views.ListView.class)
    private String notificationContent;

    private String userName;  // Người gửi thông báo

    private List<Integer> userIds;  // Danh sách ID người nhận thông báo

    private Boolean notificationDraft;  // Trạng thái bản nháp

    private List<String> userNames;  // Danh sách tên người dùng nhận thông báo

    private boolean isNotificatonViewed;

    private String notificationLink; //new field

    @JsonView(Views.ListView.class)
    private String createdAt;

    @JsonView(Views.ListView.class)
    private String updatedAt;  // Thời gian cập nhật
}
