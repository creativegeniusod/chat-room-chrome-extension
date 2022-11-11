function getLoginOptions() {
    if (db_app_url === undefined) getLoginOptions();
    else {
        const headers = {
            "content-type": "application/json;charset=UTF-8"
        };

        Request.get(`${db_app_url}api/v1/sign/options/`, headers)
        .then( (data) => {
            const { status, options } = data;
            options.forEach((item, i) => {
                $(`.${item.name}`).show();
            });

        })
        .catch( err => {
            console.log('err------', err);
        });
    }
}



setTimeout(() => {
    getLoginOptions();
}, 100);
