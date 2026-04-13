package com.unleashed.rest;

import com.unleashed.entity.Rank;
import com.unleashed.entity.User;
import com.unleashed.entity.UserRank;
import com.unleashed.service.RankService;
import com.unleashed.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/ranks")
public class RankRestController {

    private final RankService rankService;
    private final UserService userService;


    @Autowired
    public RankRestController(RankService rankService, UserService userService) {
        this.rankService = rankService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Rank>> getRanks() {
        return ResponseEntity.ok(rankService.getRanks());
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/{username}")
    public ResponseEntity<?> getRanks(@PathVariable("username") String username) {
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user.getUserRank());
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @GetMapping("/register/{username}")
    public ResponseEntity<?> registerUser(@PathVariable("username") String username) {
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        //System.out.println(user.getUsername());
        return ResponseEntity.ok(rankService.register(user));
    }

    @PreAuthorize("hasAuthority('CUSTOMER')")
    @DeleteMapping("/unregister/{username}")
    public ResponseEntity<?> unregisterUser(@PathVariable("username") String username) {
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rankService.unregister(user));
    }

    @PreAuthorize("hasAnyAuthority('STAFF','ADMIN')")
    @GetMapping("/dashboard/memberships")
    public ResponseEntity<?> getUserRanks(@RequestParam(defaultValue = "1") int page,
                                          @RequestParam(defaultValue = "10") int size,
                                          @RequestParam(required = false) String search,
                                          @RequestParam int filter) {
        //System.out.println("Filter: " + filter);
        Page<UserRank> userRankList = rankService.getUserRankList(page, size, search, filter);
        return ResponseEntity.ok(userRankList.getContent());
    }
}
