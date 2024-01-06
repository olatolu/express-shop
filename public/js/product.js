const deleteProduct = (btn) => {

    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const csrfToken = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElement =  btn.closest('article');

    console.log(productId)

    fetch('/admin/product/'+productId, {
        method: 'DELETE',
        headers: {
            'csrf-token':csrfToken
        }
    }).then(result => {
        return result.json()
    }).then(data => {
        console.log(data);
        // productElement.remove() //all modern browser
        productElement.parentNode.removeChild(productElement) //compatible with older browser

    })
    .catch((err) => {
        console.log(err);
    })
}