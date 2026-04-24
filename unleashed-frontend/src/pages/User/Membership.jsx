
import { Box, Button, Card, CircularProgress, Divider, Grid2, List, ListItem, ListItemIcon, ListItemText, Modal, Typography, } from '@mui/material';
import UserSideMenu from '../../components/menus/UserMenu';
import { useEffect, useState } from 'react';
import useAuthHeader from 'react-auth-kit/hooks/useAuthHeader';
import { fetchAllMembership, fetchMembership, registerMembership, unregisterMembership } from '../../service/UserService';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { AccessTime, AlignHorizontalLeft, AlignHorizontalRight, AutoAwesome, Cake, CardGiftcard, East, KeyboardArrowLeft, KeyboardArrowRight, KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight, NewReleases, Percent, RemoveCircleOutlineOutlined } from '@mui/icons-material';
import { formatPrice } from '../../components/format/formats';

export const Membership = () => {
    const authHeader = useAuthHeader();
    const user = useAuthUser();
    const [userRank, setUserRank] = useState();
    const [ranks, setRanks] = useState([])
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [loading, setLoading] = useState(false)


    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await fetchMembership(authHeader, user.username);
            setUserRank(response.data);

        } catch (error) {
            console.error('Error fetching membership:', error);
            // Handle the error appropriately (e.g., show an error message)
        } finally {
            setLoading(false)
        }
    };

    const fetchAllRanks = async () => {
        const response = await fetchAllMembership(authHeader);
        setRanks(response.data);
    };

    useEffect(() => {
        const fetchDataAndRanks = async () => {
            await Promise.all([fetchData(), fetchAllRanks()]);
        };
        fetchDataAndRanks();
    }, []);



    function NextRankDisplay() {
        const nextRank = ranks.find(rank => rank.id === userRank.rank.id + 1);

        if (nextRank) {
            return (
                <Card style={{
                    height: '280px',
                    background: rankBackgroundColor(nextRank.id),
                    boxShadow: '10px 15px 10px rgba(0, 0, 0, 0.2)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                }}>
                    <Card style={{
                        margin: '15px',
                        height: 'calc(100% - 30px)',
                        border: `3px solid ${rankNameColor(nextRank.id)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <Typography variant="h5" component="div" style={{ fontWeight: 'bold', color: rankNameColor(nextRank.id) }}>
                                {rankIconLeft(nextRank.id)}
                                {nextRank.rankName}
                                {rankIconRight(nextRank.id)}
                            </Typography>
                        </div>
                        <List style={{ textAlign: 'center', flexGrow: 1 }}>
                            <ListItem>
                                <Typography component="span" style={{ fontWeight: 'bold' }}>
                                    Discount benefit:
                                </Typography>{' '}
                                <Typography component="span" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                    {Math.round(nextRank.rankBaseDiscount * 100)}%
                                </Typography>
                            </ListItem>
                            <Divider />
                            <ListItem>Exclusive coupons!</ListItem>
                            <Divider />
                            <ListItem>And more!</ListItem>
                            <Divider />
                        </List>
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <Typography variant="body2">
                                Requirement:{' '}
                                <strong style={{ color: rankNameColor(nextRank.id) }}>
                                    {formatPrice(userRank.moneySpent)}/{formatPrice(nextRank.rankPaymentRequirement)}
                                </strong>
                                <br></br>
                                <strong>
                                    {userRank.moneySpent >= nextRank.rankPaymentRequirement ? "1 more order to uprank!" : ""}
                                </strong>
                            </Typography>
                        </div>
                    </Card>
                </Card>
            );
        } else {
            return (
                <p>Next rank not found.</p>
            );
        }
    }

    function CurrentRankDisplay() {
        const currentRank = ranks.find(rank => rank.id === userRank.rank.id);
        if (currentRank) {
            return (
                <Card style={{
                    height: '280px',
                    background: rankBackgroundColor(currentRank.id),
                    boxShadow: '10px 15px 10px rgba(0, 0, 0, 0.2)',
                    borderRadius: '10px', // Add rounded corners
                    overflow: 'hidden' // Hide overflowing content for cleaner look
                }}>
                    <Card style={{
                        margin: '15px', // Adjusted margin for better spacing
                        height: 'calc(100% - 30px)', // Maintain height relative to parent
                        border: `3px solid ${rankNameColor(currentRank.id)}`,
                        display: 'flex',
                        flexDirection: 'column', // Arrange content vertically
                        justifyContent: 'space-between' // Distribute space between elements
                    }}>
                        <div style={{ textAlign: 'center', padding: '10px 0' }}> {/* Centered header */}
                            <Typography variant="h5" component="div" style={{ fontWeight: 'bold', color: rankNameColor(currentRank.id) }}>
                                {rankIconLeft(currentRank.id)}
                                {currentRank.rankName}
                                {rankIconRight(currentRank.id)}
                            </Typography>
                        </div>
                        <List style={{ textAlign: 'center', flexGrow: 1 }}> {/* Centered list with flexGrow */}
                            <ListItem>
                                <Typography component="span" style={{ fontWeight: 'bold' }}>
                                    Discount benefit:
                                </Typography>{' '}
                                <Typography component="span" style={{ color: '#8B4513', fontWeight: 'bold' }}>
                                    {Math.round(currentRank.rankBaseDiscount * 100)}%
                                </Typography>
                            </ListItem>
                            <Divider />
                            <ListItem>Exclusive coupons!</ListItem> {/* More specific benefit */}
                            <Divider />
                            <ListItem>And more!</ListItem> {/* Another specific benefit */}
                            <Divider />
                        </List>
                    </Card>
                </Card>
            );
        } else {
            return (
                <p>Next rank not found.</p>
            );
        }
    }

    const rankBackgroundColor = (rankId) => {
        const colors = {
            2: 'linear-gradient(45deg, #b87333 0%, #966334 10%, #cd7f32 25%, #e2b3b3 50%, #d2b48c 75%, #ede3d6 100%)',
            3: 'linear-gradient(45deg, #c0c0c0 0%, #a9a9a9 10%, #d3d3d3 25%, #e0e0e0 50%, #f0f0f0 75%, #f8f8f8 100%)',
            4: 'linear-gradient(45deg, #ffe135 0%, #f0c841 10%, #ffe766 25%, #ffe135 50%, #f5e0b8 75%, #fffacd 100%)',
            5: 'linear-gradient(45deg, #a8d8ff 0%, #8ac0ff 15%, #e0f8ff 30%, #ffffff 50%, #e0f8ff 70%, #8ac0ff 85%, #a8d8ff 100%)',
        };
        return colors[rankId];
    };

    const rankIconLeft = (rankId) => {
        const icons = {
            2: <KeyboardArrowLeft style={{ color: '#cd7f32' }} />,
            3: <KeyboardDoubleArrowLeft style={{ color: '#d3d3d3' }} />,
            4: <AlignHorizontalRight style={{ color: '#f0c841' }} />,
            5: <AutoAwesome style={{ color: '#a8d8ff' }} />,
        };
        return icons[rankId];
    };

    const rankIconRight = (rankId) => {
        const icons = {
            2: <KeyboardArrowRight style={{ color: '#cd7f32' }} />,
            3: <KeyboardDoubleArrowRight style={{ color: '#d3d3d3' }} />,
            4: <AlignHorizontalLeft style={{ color: '#f0c841' }} />,
            5: <AutoAwesome style={{ color: '#a8d8ff' }} />,
        };
        return icons[rankId];
    };

    const rankNameColor = (rankId) => {
        const colors = {
            2: '#B87333',
            3: '#778899',
            4: '#8B4513',
            5: '#A9A9A9',
        };
        return colors[rankId];
    };


    const register = async () => {
        setLoading(true)
        await registerMembership(authHeader, user.username);
        fetchData();
    }

    const unregister = async () => {
        await unregisterMembership(authHeader, user.username);
        setOpen(false);
        fetchData();
    }



    return (
        <Grid2 container spacing={2}>
            <Grid2 size={4}>
                <UserSideMenu />
            </Grid2>
            {loading === true ? <CircularProgress size={100} color="secondary" /> : (
                <Grid2 size={7} marginRight={'20px'}>
                    <Divider>Membership</Divider>
                    {userRank && userRank?.rankStatus > 0 ? (
                        userRank.rank.id === 5 ?
                            <CurrentRankDisplay />
                            :
                            <Grid2 container spacing={2}>
                                <Grid2 size={5} >
                                    <CurrentRankDisplay />
                                </Grid2>
                                <Grid2 size={2} style={{
                                    height: '300px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}><East /></Grid2>
                                <Grid2 size={5} >
                                    <NextRankDisplay />
                                </Grid2>
                            </Grid2>) :
                        (<Card>
                            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary' }}>
                                Join the Club & Unlock Exclusive Perks
                            </Typography>
                            <Typography variant="subtitle1" align="center" gutterBottom>
                                Get exclusive discounts, early access to promotions, and more!
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemIcon><NewReleases color="primary" /></ListItemIcon>
                                    <ListItemText primary="Exclusive discounts on new arrivals" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Percent color="primary" /></ListItemIcon>
                                    <ListItemText primary="Base discount on all purchases" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><Cake color="primary" /></ListItemIcon>
                                    <ListItemText primary="Birthday rewards" />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon><AccessTime color="primary" /></ListItemIcon>
                                    <ListItemText primary="Early access to promotions" />
                                </ListItem>
                            </List>
                        </Card>)
                    }
                    <Box sx={{ display: 'flex', alignContent: 'center', marginTop: 3 }}></Box>
                    {!userRank || userRank?.rankStatus < 0 ?

                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<CardGiftcard />}
                            onClick={register} // Replace with your registration logic
                            sx={{ padding: '12px 24px', borderRadius: '8px' }} // Custom button styling
                        >
                            Unlock Member Benefits
                        </Button>

                        :
                        <Button
                            variant="contained"
                            color="error" // Use error color for unregister
                            size="large"
                            startIcon={<RemoveCircleOutlineOutlined />}
                            sx={{ padding: '12px 24px', borderRadius: '8px' }}
                            onClick={handleOpen} // Replace with your unregister logic
                        >
                            UNREGISTER MEMBERSHIP
                        </Button>
                    }
                    <Box />
                </Grid2>)}

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    height: '200px',
                    backgroundColor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '10px',
                    padding: '20px', // Add padding for better spacing
                }}>
                    <Box style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <Typography id="modal-modal-title" variant="h4" component="h2">
                            Confirm Unregistration
                        </Typography>
                    </Box>
                    <Box style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography id="modal-modal-description" style={{ textAlign: 'center' }}>
                            Are you sure you want to unregister?
                        </Typography>
                    </Box>
                    <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <Button onClick={handleClose} color="primary" style={{ marginRight: '10px' }}>
                            Cancel
                        </Button>
                        <Button onClick={unregister} color="error" variant="contained">
                            Unregister
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Grid2 >

    )
}
export default Membership