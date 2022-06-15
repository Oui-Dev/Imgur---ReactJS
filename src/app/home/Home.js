import './Home.scss'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import {CardActionArea} from '@mui/material'
import imgTest from '../../assets/contemplative-reptile.jpg'

export default function Home() {
    const itemsArray = [
        {title: 'pute1', desc: 'je suis la pute1'},
        {title: 'pute2', desc: 'je suis la pute2'},
        {title: 'pute3', desc: 'je suis la pute3'},
        {title: 'pute4', desc: 'je suis la pute4'},
        {title: 'pute5', desc: 'je suis la pute5'},
        {title: 'pute6', desc: 'je suis la pute6'},
        {title: 'pute7', desc: 'je suis la pute7'},
    ]

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
