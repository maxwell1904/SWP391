package com.unleashed.repo;

import com.unleashed.entity.CommentParent;
import com.unleashed.entity.composite.CommentParentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface CommentParentRepository extends JpaRepository<CommentParent, CommentParentId> {
}
