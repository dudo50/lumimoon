<template>
    <b-carousel>
        <b-carousel-item v-for="(carousel, i) in carousels" :key="i">
            <section :class="`hero is-medium`">
                <div class="hero-body has-text-centered">
                    <b-image :src="carousel.image" /> 
                </div>
            </section>
        </b-carousel-item>
    </b-carousel>
</template>

<script lang="ts">
export default {
    data(){
        return {
            carousels: [
                {
                    title: 'Slide 1',
                    image: require("@/assets/main.jpg")
                },                
            ]
        }
    }
}
</script>