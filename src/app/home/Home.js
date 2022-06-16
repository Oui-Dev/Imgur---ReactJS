import './Home.scss'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import {CardActionArea} from '@mui/material'

import imgTest from '../../assets/contemplative-reptile.jpg'

import axios from 'axios'
import {Buffer} from 'buffer'
import {useState, useEffect} from 'react'

export default function Home() {
    const [accessToken, setAccessToken] = useState()

    const itemsArray = [
        {title: 'test1', desc: 'je suis le test1'},
        {title: 'test2', desc: 'je suis le test2'},
        {title: 'test3', desc: 'je suis le test3'},
        {title: 'test4', desc: 'je suis le test4'},
        {title: 'test5', desc: 'je suis le test5'},
        {title: 'test6', desc: 'je suis le test6'},
        {title: 'test7', desc: 'je suis le test7'},
    ]

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
    var config = {
        method: 'get',
        url: 'https://api.imgur.com/3/account/me/images',
        headers: {Authorization: `Bearer ${accessToken}`},
    }

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data))
        })
        .catch(function (error) {
            console.log(error)
        })

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
            <Grid container spacing={3} columns={{xs: 3, sm: 6, md: 9, lg: 12}}>
                {Array.from(itemsArray).map((arrItem, index) => (
                    <Grid item xs={3} key={index}>
                        <CardItem name={arrItem.title} desc={arrItem.desc} />
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}
