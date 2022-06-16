import './Home.scss'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import {CardActionArea} from '@mui/material'

import imgTest from '../../assets/contemplative-reptile.jpg'

import {QueryClient, QueryClientProvider, useQuery} from 'react-query'
import axios from 'axios'
import {Buffer} from 'buffer'
import {useState, useEffect} from 'react'

export default function Home() {
    const [accessToken, setAccessToken] = useState()
    const queryClient = new QueryClient()

    // recup le token d'accès
    useEffect(() => {
        if (!accessToken) {
            if (document.cookie.split(';').some((item) => item.trim().startsWith('token='))) {
                const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('token='))
                const data = JSON.parse(Buffer.from(cookieValue.split('=')[1], 'base64').toString())
                setAccessToken(data.access_token)
            } else {
                getNewAccessToken()
            }
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

    // recup les images du compte
    function GetProfileGallery({accessToken}) {
        const config = {
            method: 'get',
            url: 'https://api.imgur.com/3/account/me/images',
            headers: {Authorization: `Bearer ${accessToken}`},
        }

        const {isLoading, error, data, isFetching} = useQuery('repoData', () => axios(config).then((res) => res.data))

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

        console.log(data)

        return (
            <Grid container spacing={3} columns={{xs: 3, sm: 6, md: 9, lg: 12}}>
                {Array.from(data.data).map((arrItem, index) => (
                    <Grid item xs={3} key={index}>
                        <CardItem name={arrItem.title} desc={arrItem.desc} />
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

    const CardItem = ({name, desc}) => {
        return (
            <Card sx={{maxWidth: 345}}>
                <CardActionArea>
                    <CardMedia component="img" height="140" image={imgTest} alt="green iguana" />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            {name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {desc}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        )
    }

    return (
        <div className="homeContent">
            {accessToken ? (
                <QueryClientProvider client={queryClient}>
                    <GetProfileGallery accessToken={accessToken} />
                </QueryClientProvider>
            ) : null}
            <span
                className="material-symbols-rounded"
                onClick={(e) => {
                    console.log(e)
                }}>
                cloud_upload
            </span>
        </div>
    )
}
