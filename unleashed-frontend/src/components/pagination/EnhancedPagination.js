import React, { useState, useMemo } from 'react';
import { Button, IconButton, TextField } from '@mui/material';
import { FirstPage, LastPage, ChevronLeft, ChevronRight } from '@mui/icons-material';

const EnhancedPagination = ({ currentPage, totalPages, onPageChange, isLoading = false }) => {
    const [inputPage, setInputPage] = useState("");

    const handleGoToPage = (e) => {
        e.preventDefault();
        const pageNumber = parseInt(inputPage, 10);
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            onPageChange(pageNumber - 1);
            setInputPage("");
        }
    };

    const paginationRange = useMemo(() => {
        const totalPageNumbers = 7;
        if (totalPages <= totalPageNumbers) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const siblingCount = 1;
        const leftSiblingIndex = Math.max(currentPage - siblingCount, 0);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 1);

        const shouldShowLeftDots = leftSiblingIndex > 1;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;
        const ELLIPSIS = "...";

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * siblingCount;
            let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
            return [...leftRange, ELLIPSIS, totalPages];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * siblingCount;
            let rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + 1 + i);
            return [firstPageIndex, ELLIPSIS, ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = Array.from({ length: rightSiblingIndex - leftSiblingIndex + 1 }, (_, i) => leftSiblingIndex + i + 1);
            return [firstPageIndex, ELLIPSIS, ...middleRange, ELLIPSIS, lastPageIndex];
        }
        return [];
    }, [currentPage, totalPages]);


    return (
        <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-2 text-sm">
            <div className="flex items-center gap-1">
                <IconButton onClick={() => onPageChange(0)} disabled={currentPage === 0 || isLoading} size="small" title="First Page">
                    <FirstPage />
                </IconButton>
                <IconButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0 || isLoading} size="small" title="Previous Page">
                    <ChevronLeft />
                </IconButton>

                {paginationRange.map((page, index) =>
                    page === "..." ? (
                        <span key={`dots-${index}`} className="px-2 py-1">...</span>
                    ) : (
                        <Button
                            key={page}
                            onClick={() => onPageChange(page - 1)}
                            variant={currentPage === page - 1 ? 'contained' : 'outlined'}
                            size="small"
                            disabled={isLoading}
                            sx={{ minWidth: '36px', padding: '4px 8px' }}
                        >
                            {page}
                        </Button>
                    )
                )}

                <IconButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages - 1 || isLoading} size="small" title="Next Page">
                    <ChevronRight />
                </IconButton>
                <IconButton onClick={() => onPageChange(totalPages - 1)} disabled={currentPage === totalPages - 1 || isLoading} size="small" title="Last Page">
                    <LastPage />
                </IconButton>
            </div>

            <form onSubmit={handleGoToPage} className="flex items-center gap-2 ml-4">
                <TextField
                    type="number"
                    size="small"
                    label="Go to"
                    variant="outlined"
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    disabled={isLoading || totalPages === 0}
                    inputProps={{ min: 1, max: totalPages, style: { width: '50px' } }}
                />
                <Button type="submit" variant="contained" size="small" disabled={isLoading || totalPages === 0}>
                    Go
                </Button>
            </form>
        </div>
    );
};

export default EnhancedPagination;