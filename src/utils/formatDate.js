export default function FormatDate(datetime){
    const data = new Date(datetime)
    return data.getHours()+":"+data.getMinutes()+","+ data.getDate()+'-'+data.getMonth()+'-'+data.getFullYear()
}