package com.unleashed.rest;

import com.unleashed.service.MessengerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messenger")
public class MessengerRestController {

    private final MessengerService messengerService;

    @Autowired
    public MessengerRestController(MessengerService messengerService) {
        this.messengerService = messengerService;
    }


    @GetMapping("/redirectToMessenger")
    public String redirectToMessenger() {
        return messengerService.getMessengerUrl();
    }
}