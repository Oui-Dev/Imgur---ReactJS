import './Home.scss'
import {Grid, Card, CardContent, CardMedia, CardActions, Typography} from '@mui/material'
import {ToggleButton, ToggleButtonGroup, Backdrop} from '@mui/material'
import {QueryClient, QueryClientProvider, useQuery} from 'react-query'
import {useState, useEffect, useRef} from 'react'
import {Buffer} from 'buffer'
import axios from 'axios'

const initialConfig = {
    method: 'get',
    url: 'https://api.imgur.com/3/gallery/hot/viral?showViral=true&mature=false',
    headers: {Authorization: 'Client-ID ce9ecff3e16a7b6'},
}

export default function Home() {
    const [accessToken, setAccessToken] = useState()
    const [displayConfig, setDisplayConfig] = useState(initialConfig)
    const [open, setOpen] = useState(false)
    const displayState = useRef('viral')
    const queryClient = new QueryClient()

    // recup le token d'accès
    useEffect(() => {
        if (document.cookie.split(';').some((item) => item.trim().startsWith('token='))) {
            const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('token='))
            const data = JSON.parse(Buffer.from(cookieValue.split('=')[1], 'base64').toString())
            setAccessToken(data.access_token)
        } else {
            getNewAccessToken()
        }
    }, [])

    // génère un token d'accès
    function getNewAccessToken() {
        var data = new FormData()
        data.append('client_id', 'ce9ecff3e16a7b6')
        data.append('client_secret', 'dc7a9ac237093e0986ae231bb1e00ccc3c45c4bb')
        data.append('refresh_token', 'b22d91c293b4cde3a93f3b71e87a38e77eeb8757')
        data.append('grant_type', 'refresh_token')

        const config = {
            method: 'POST',
            url: 'https://api.imgur.com/oauth2/token',
            data: data,
        }

        axios(config)
            .then(function (response) {
                const data = Buffer.from(JSON.stringify(response.data)).toString('base64')
                const delay = response.data.expires_in - 60
                document.cookie = `token=${data}; path=/; max-age=${delay};`
                setAccessToken(response.data.access_token)
            })
            .catch(function (error) {
                console.log(error)
            })
    }

    // recup les images selon la config
    function GetGallery({config}) {
        const {isLoading, error, data, isFetching} = useQuery('getGallery', () => axios(config).then((res) => res.data))

        if (isLoading)
            return (
                <Grid container justifyContent="center">
                    Loading...
                </Grid>
            )
        if (error)
            return (
                <Grid container justifyContent="center">
                    An error has occurred {error.message}
                </Grid>
            )

        return (
            <Grid container spacing={3} columns={{xs: 3, sm: 6, md: 9, lg: 12}}>
                {Array.from(data.data).map((arrItem, index) => (
                    <Grid item xs={3} key={index}>
                        <CardItem data={arrItem} />
                    </Grid>
                ))}
                {data.data.length === 0 ? (
                    <Grid item xs={12}>
                        Aucune photo
                    </Grid>
                ) : null}
                {isFetching ? (
                    <Grid item xs={12}>
                        Updating...
                    </Grid>
                ) : null}
            </Grid>
        )
    }

    // change la config axios pour modifier l'affichage
    function changeDisplay(e, state) {
        let config = {}
        displayState.current = state
        if (state === 'viral') {
            config = initialConfig
        } else if (state === 'personnel') {
            config = {
                method: 'get',
                url: 'https://api.imgur.com/3/account/me/images',
                headers: {Authorization: `Bearer ${accessToken}`},
            }
        }
        setDisplayConfig(config)
    }

    const CardItem = ({data}) => {
        return (
            <Card sx={{maxWidth: 345}}>
                {data.images ? (
                    <CardMedia
                        component={data.images[0].type === 'video/mp4' ? 'video' : 'img'}
                        image={data.images[0].link}
                        controls
                        alt="imgur content"
                    />
                ) : null}
                <CardContent>
                    <Typography gutterBottom variant="h7" component="div">
                        {data.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data.description}
                    </Typography>
                </CardContent>
                <CardActions>
                    <div className="cardActionsFooter">
                        {data.ups}
                        <i className="bx bxs-upvote"></i>
                    </div>
                    <div className="cardActionsFooter">
                        {data.comment_count}
                        <i className="bx bxs-chat"></i>
                    </div>
                    <div className="cardActionsFooter">
                        {data.views}
                        <i className="bx bxs-show"></i>
                    </div>
                </CardActions>
            </Card>
        )
    }

    return (
        <div className="homeContent">
            <ToggleButtonGroup
                color="primary"
                value={displayState.current}
                exclusive
                onChange={changeDisplay}
                className="switch">
                <ToggleButton value="viral">Viral</ToggleButton>
                <ToggleButton value="personnel">Personnel</ToggleButton>
            </ToggleButtonGroup>
            <QueryClientProvider client={queryClient}>
                <GetGallery config={displayConfig} />
            </QueryClientProvider>
            <i
                className="bx bx-cloud-upload"
                onClick={() => {
                    setOpen(!open)
                }}></i>

            <Backdrop open={open}>
                <Card sx={{minWidth: 275}}>
                    <CardContent className="uploadForm">
                        <i
                            class="bx bx-x"
                            onClick={() => {
                                setOpen(false)
                            }}></i>
                        <Typography variant="h5" component="div">
                            Publication
                        </Typography>
                        <form method="post" enctype="multipart/form-data">
                            <input type="text" placeholder="Titre" required />
                            <input type="file" accept=".jpg, .png, .jpeg, .mp4" required />
                            <button type="submit">Publier</button>
                        </form>
                    </CardContent>
                </Card>
            </Backdrop>
        </div>
    )
}
