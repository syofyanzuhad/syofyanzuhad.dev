<template>
  <p>
    If you enjoy my work and find them useful,
    consider sponsor me and the ecosystem to help Open Source sustainable. Thank you!
  </p>

  <p flex="~ gap-2 wrap items-center">
    <SponsorButtonCollective />
    <!-- <span op50 text-sm>
      <a href="/posts/sponsorship-forwarding" target="_blank">How does this work?</a>
    </span> -->
  </p>
  <p flex="~ gap-2 wrap">
    <a
      href="https://github.com/sponsors/syofyanzuhad"
      target="_blank"
      class="group btn-rose inline-block"
    >
      <div
        i-ph-heart-duotone
        group-hover="i-ph-heart-fill text-rose"
        transition-all duration-200 ease-out
      />
      Sponsor to support my open-source
    </a>
    <a
      href="https://trakteer.id/syofyanzuhad/tip"
      target="_blank"
      class="group btn-yellow inline-block"
    >
      <div
        i-ph-lightning-duotone
        group-hover="i-ph-lightning-fill text-yellow"
        transition-all duration-200 ease-out
      />
      Trakteer me
    </a>
  </p>
</template>
