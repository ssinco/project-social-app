
/* 
JS script sheet for the newsfeed ------------------------*/

const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

const viewComments = document.querySelectorAll('.viewComments')
const commentShowButton = document.querySelectorAll('.commentShowButton')

/* 
Listeners ------------------------*/

// add an event listener to all viewComment buttons
    // when clicked, add the class 'active' for 'viewComment' divs that match the post-id of the button

commentShowButton.forEach((button)=>{
    button.addEventListener('click', () =>{
        const postId = button.getAttribute('data-id')
        
        viewComments.forEach((commentSection,index,obj)=>{
            if (commentSection.children.length > 0 && postId === commentSection.getAttribute('data-id')){
                
                if(!commentSection.classList.contains('active')){
                    commentSection.classList.add('active')
                } else {
                    commentSection.classList.remove('active')
                }
            }
        })
    })
})

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const postId = button.getAttribute('data-id')
        const postContent = button.getAttribute('data-content')
        // const form = document.getElementById('deleteForm')
        // form.action = `/feed/delete/${postId}?_method=DELETE`
        
        const modal = document.querySelector(button.dataset.modalTarget)
        if (modal.classList.contains('edit')){
            const form = document.getElementById('editForm')
            const textarea = form.querySelector('textarea[name="content"]')
            textarea.value = postContent
            form.action = `/profile/edit/${postId}?_method=PUT`
        } else if (modal.classList.contains('delete')){
            const form = document.getElementById('deleteForm')
            form.action = `/profile/delete/${postId}?_method=DELETE`
        }

        openModal(modal)
    })
})


closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('clicked')
        const modal = button.closest('.modal')
        closeModal(modal)
    })
})

/* 
Functions ------------------------*/

function openModal(modal) {
    if (modal== null) return
    modal.classList.add('active')
    overlay.classList.add('active')
}

function closeModal(modal){
    if (modal== null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
}