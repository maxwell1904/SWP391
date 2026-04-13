package com.unleashed.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.unleashed.util.Views;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "\"user\"", schema = "dbo")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "is_user_enabled")
    private Boolean isUserEnabled;

    @JsonIgnore
    @Nationalized
    @Column(name = "user_google_id")
    private String userGoogleId;

    @Nationalized
    @Column(name = "user_username")
    @JsonView(Views.TransactionView.class)
    private String userUsername;

    @JsonIgnore
    @Nationalized
    @Column(name = "user_password")
    private String userPassword;

    @Nationalized
    @Column(name = "user_fullname", length = 255)
    private String userFullname;

    @Nationalized
    @Column(name = "user_email", length = 255)
    private String userEmail;

    @Size(max = 12)
    @Nationalized
    @Column(name = "user_phone", length = 12)
    private String userPhone;

    @Nationalized
    @Column(name = "user_birthdate")
    private String userBirthdate;

    @Nationalized
    @Column(name = "user_address")
    private String userAddress;

    @Nationalized
    @Column(name = "user_image")
    private String userImage;

    @Nationalized
    @Column(name = "user_current_payment_method")
    private String userCurrentPaymentMethod;

    @Column(name = "user_created_at")
    private OffsetDateTime userCreatedAt;

    @Column(name = "user_updated_at")
    private OffsetDateTime userUpdatedAt;

    @JsonIgnore
    @OneToOne(mappedBy = "user")
    private UserRank userRank;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(this.getRole().getRoleName()));
    }

    @Override
    public String getPassword() {
        return this.getUserPassword();
    }

    @Override
    public String getUsername() {
        return this.getUserUsername();
    }

    @Override
    public boolean isEnabled() {
        return this.getIsUserEnabled();
    }

    @PrePersist
    public void prePersist() {
        setUserCreatedAt(OffsetDateTime.now());
        setUserUpdatedAt(OffsetDateTime.now());
    }

    @PreUpdate
    public void preUpdate() {
        setUserUpdatedAt(OffsetDateTime.now());
    }
}