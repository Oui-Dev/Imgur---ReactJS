import './Home.scss'
import {Grid, Card, CardContent, CardMedia, CardActions, Typography} from '@mui/material'
import {ToggleButton, ToggleButtonGroup, Backdrop, Snackbar, Alert} from '@mui/material'
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
    const [openForm, setOpenForm] = useState(false)
    const [openSnackbar, setOpenSnackbar] = useState(false)
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
                    <Grid item className="flex justify-center" xs={3} key={index}>
                        <CardItem data={arrItem} />
                    </Grid>
                ))}
                {data.data.length === 0 ? (
                    <Grid item className="flex justify-center" xs={12}>
                        Aucune photo
                    </Grid>
                ) : null}
                {isFetching ? (
                    <Grid item className="flex justify-center" xs={12}>
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

    // upload un fichier sur imgur
    function onSubmit(e) {
        e.preventDefault()
        const title = e.target.querySelector('input[type=text]').value
        const file = e.target.querySelector('input[type=file]').files[0]
        const authorizedFile = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'video/mp4',
            'video/webm',
            'video/x-matroska',
            'video/quicktime',
            'video/x-flv',
            'video/x-msvideo',
            'video/x-ms-wmv',
            'video/mpeg',
        ]

        if (authorizedFile.includes(file.type)) {
            const formData = new FormData()
            formData.append(file.type.substring(0, 5), file)
            formData.append('type', 'file')
            formData.append('title', title)

            const config = {
                method: 'post',
                url: 'https://api.imgur.com/3/image',
                'Content-type': 'application/x-www-form-urlencoded',
                // headers: {Authorization: 'Client-ID ce9ecff3e16a7b6'}, // Anonymous
                headers: {Authorization: `Bearer ${accessToken}`}, // Authenticated
                data: formData,
            }
            axios(config)
                .then(function () {
                    setOpenForm(false)
                    setOpenSnackbar(true)
                })
                .catch(function (error) {
                    console.log(error)
                })
        }
    }

    const CardItem = ({data}) => {
        return (
            <Card sx={{maxWidth: 345}} className="relative pb-9">
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
                <CardActions className="absolute bottom-1 justify-around w-full">
                    <div className="flex items-center gap-1">
                        {data.ups}
                        <i className="bx bxs-upvote"></i>
                    </div>
                    <div className="flex items-center gap-1">
                        {data.comment_count}
                        <i className="bx bxs-chat"></i>
                    </div>
                    <div className="flex items-center gap-1">
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
            <i className="bx bx-cloud-upload" onClick={() => setOpenForm(!openForm)} />

            <Backdrop open={openForm}>
                <Card sx={{minWidth: 300}} className="relative">
                    <CardContent className="uploadForm">
                        <i
                            className="bx bx-x absolute top-1 right-1 text-2xl cursor-pointer"
                            onClick={() => {
                                setOpenForm(false)
                            }}></i>
                        <Typography variant="h5" component="div">
                            Publication
                        </Typography>
                        <form
                            method="post"
                            encType="multipart/form-data"
                            className="flex flex-col"
                            onSubmit={(e) => onSubmit(e)}>
                            <input type="text" placeholder="Titre" required />
                            <input type="file" accept=".jpg, .png, .jpeg, .mp4" required />
                            <button type="submit">Publier</button>
                        </form>
                    </CardContent>
                </Card>
            </Backdrop>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={4000}
                anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                onClose={() => setOpenSnackbar(false)}>
                <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
                    Fichier ajouté !
                </Alert>
            </Snackbar>
        </div>
    )
}
