package com.unleashed.service;

import com.unleashed.entity.Rank;
import com.unleashed.entity.User;
import com.unleashed.entity.UserRank;
import com.unleashed.repo.RankRepository;
import com.unleashed.repo.UserRankRepository;
import com.unleashed.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Service
public class RankService {
    private final RankRepository rankRepository;
    private final UserRepository userRepository;
    private final UserRankRepository userRankRepository;

    @Autowired
    public RankService(RankRepository rankRepository, UserRepository userRepository, UserRankRepository userRankRepository) {
        this.rankRepository = rankRepository;
        this.userRepository = userRepository;
        this.userRankRepository = userRankRepository;
    }

    public List<Rank> getRanks() {
        return rankRepository.findAll();
    }

    public boolean register(User user) {
        try {
            if (user.getUserRank() == null) user.setUserRank(UserRank
                    .builder()
                    .rank(rankRepository.findById(1).orElse(null))
                    .user(user)
                    .rankStatus((short) 1)
                    .moneySpent(BigDecimal.valueOf(0))
                    .build());
            if (user.getUserRank().getRankStatus() < 1) {
                user.getUserRank().setRankStatus((short) 1);
                user.getUserRank().setMoneySpent(BigDecimal.valueOf(0));
                user.getUserRank().setRank(rankRepository.findById(1).orElse(null));
                user.getUserRank().setRankExpireDate(LocalDate.now().plusYears(1));
            }
            userRankRepository.save(user.getUserRank());
            return true;
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return false;
        }
    }

    public boolean unregister(User user) {
        try {
            if (user.getUserRank() != null && (user.getUserRank().getRankStatus() >= 1)) {
                user.getUserRank().setRankStatus((short) -1);
                userRepository.save(user);
                return true;
            } else {
                throw new Exception();
            }
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
        return false;
    }


    public User addMoneySpent(User user, BigDecimal moneySpent) {
        user.getUserRank().setMoneySpent(user.getUserRank().getMoneySpent().add(moneySpent));
        userRankRepository.save(user.getUserRank());
        return user;
    }

    public User removeMoneySpent(User user, BigDecimal moneySpent) {
        user.getUserRank().setMoneySpent(user.getUserRank().getMoneySpent().subtract(moneySpent));
        userRankRepository.save(user.getUserRank());
        return user;
    }

    public boolean isRankExpired(User user) {
//       System.out.println("RankExpire Date:" + user.getUserRank().getRankExpireDate());
//       System.out.println("System time: " + LocalDate.now());
//        System.out.println(user.getUserRank().getRankExpireDate().isAfter(LocalDate.now()) ? "Still valid" : "Time to check");
        return !user.getUserRank().getRankExpireDate().isAfter(LocalDate.now());
    }

    public boolean checkUpRank(User user) {
        Rank nextRank = rankRepository.findById(user.getUserRank().getRank().getId() + 1).orElse(null);
        if (nextRank != null) {
//            System.out.println("User has spent: " + user.getUserRank().getMoneySpent());
//            System.out.println("Next Rank: " + nextRank.toString());
//            System.out.println("Require: " + nextRank.getRankPaymentRequirement());
            return user.getUserRank().getMoneySpent().compareTo(nextRank.getRankPaymentRequirement()) >= 0;
        } else {
//            System.out.println("Rank is maximum!");
            return false;
        }
    }

    public boolean checkDownRank(User user) {
        Rank currentRank = user.getUserRank().getRank();
        Rank nextRank = rankRepository.findById(currentRank.getId() + 1).orElse(null);

        BigDecimal halfRequirement = Objects.requireNonNullElse(nextRank, currentRank)
                .getRankPaymentRequirement().divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP);

        return user.getUserRank().getMoneySpent().compareTo(halfRequirement) < 0;
    }


    public void upRank(User user) {
        user.getUserRank().setRank(rankRepository.findById(user.getUserRank().getRank().getId() + 1).orElse(null));
        user.getUserRank().setRankExpireDate(LocalDate.now().plusYears(1));
        userRankRepository.saveAndFlush(user.getUserRank());
    }

    public void downRank(User user) {
        Rank currentRank = user.getUserRank().getRank();
        Rank previousRank = rankRepository.findById(currentRank.getId() - 1).orElse(null);

        if (previousRank != null) {
            user.getUserRank().setRank(previousRank);
            user.getUserRank().setMoneySpent(previousRank.getRankPaymentRequirement()); // Reset membership points to the new rank's requirement
            user.getUserRank().setRankExpireDate(LocalDate.now().plusYears(1));
        } else {
            // User is at the lowest rank; ensure they maintain the minimum points
            user.getUserRank().setMoneySpent(currentRank.getRankPaymentRequirement());
        }
        userRankRepository.saveAndFlush(user.getUserRank());
    }

    public boolean hasRegistered(User user) {
        return user.getUserRank() != null;
    }

    public Page<UserRank> getUserRankList(int page, int size, String search, int filter) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "rank.id"));

        Page<UserRank> userRankPage = (search != null && !search.trim().isEmpty()) ? userRankRepository.findBySearch(search, pageable) : userRankRepository.findAll(pageable);


        return new PageImpl<>(filter == 0 ? userRankPage.getContent() : userRankPage.stream().filter(ur -> ur.getRankStatus() == filter).toList(), pageable, userRankPage.getTotalElements());
    }
}
