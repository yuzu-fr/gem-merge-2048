<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import AppIcon from './components/AppIcon.vue'
import GemIcon from './components/GemIcon.vue'
import GameBoard from './components/GameBoard.vue'
import ModalDialog from './components/ModalDialog.vue'
import { useGame } from './composables/useGame.ts'
import { GEMS, gemFor, type Gem } from './game/gems.ts'

const {
  state,
  renderedTiles,
  busy,
  mergedIds,
  spawnedId,
  scoreGain,
  toast,
  storageWarning,
  hasSave,
  move,
  restart,
  undo,
  continueGame,
  persist,
  canUndo,
  showWin,
} = useGame()
const screen = ref<'home' | 'game' | 'collection'>(hasSave ? 'game' : 'home')
watch(screen, async () => {
  await nextTick()
  window.scrollTo(0, 0)
})
const hasStarted = ref(hasSave)
const modal = ref<'help' | 'restart' | null>(null)
const selectedGem = ref<Gem | null>(null)
const gameHighest = computed(() => Math.max(...state.value.tiles.map((tile) => tile.value)))
const highestGem = computed(() => gemFor(gameHighest.value))
const nextGem = computed(() => GEMS.find((gem) => gem.value > gameHighest.value))
const collectionCount = computed(
  () => GEMS.filter((gem) => state.value.unlocked.includes(gem.value)).length,
)
const level = computed(() => Math.min(11, Math.log2(gameHighest.value)))
const endModal = computed(
  () =>
    screen.value === 'game' &&
    !busy.value &&
    (showWin.value ? 'win' : state.value.over ? 'over' : null),
)
const boardActive = computed(
  () =>
    screen.value === 'game' && !modal.value && !selectedGem.value && !endModal.value && !busy.value,
)
const previewTiles = [0, 2, 4, 0, 8, 16, 8, 0, 0, 4, 32, 2, 0, 0, 2, 4]
const format = (value: number) => value.toLocaleString('en-US')
function startGame() {
  screen.value = 'game'
  hasStarted.value = true
  persist()
}
function newChallenge() {
  restart()
  modal.value = null
  screen.value = 'game'
  hasStarted.value = true
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <button class="wordmark" aria-label="Gem Merge 2048 首页" @click="screen = 'home'">
        <span class="brand-symbol"><AppIcon name="diamond" /></span>
        <span
          >Gem Merge <span class="brand-number">2048</span><small>珠 宝 合 成 工 坊</small></span
        >
      </button>
      <nav class="main-nav" aria-label="主导航">
        <button
          :class="{ active: screen !== 'collection' }"
          @click="hasStarted ? (screen = 'game') : (screen = 'home')"
        >
          珠宝工坊
        </button>
        <button :class="{ active: screen === 'collection' }" @click="screen = 'collection'">
          珠宝图鉴 <span class="nav-count">{{ collectionCount }}/11</span>
        </button>
      </nav>
      <button class="icon-button help-button" aria-label="玩法说明" @click="modal = 'help'">
        <AppIcon name="help" />
      </button>
    </header>

    <main v-if="screen === 'home'" class="home-page">
      <div class="home-hero">
        <section class="hero-copy">
          <p class="eyebrow"><span /> A LITTLE MOMENT OF BRILLIANCE</p>
          <h1>
            让每一次相遇，<br />都<span class="gold-text">闪闪发光。</span
            ><AppIcon name="sparkle" />
          </h1>
          <p class="hero-description">
            珠宝2048 · 合成你的璀璨珠宝<br />轻轻一滑，让相同的宝石相遇。<br
              class="mobile-break"
            />从一颗白水晶，收藏一整片光芒。
          </p>
          <button class="primary-button start-button" @click="startGame">
            {{ hasStarted ? '继续我的旅程' : '开启璀璨之旅' }}<AppIcon name="arrow" />
          </button>
          <p class="quiet-note">无需登录 <span>·</span> 随时停下，随时继续</p>
        </section>
        <div class="hero-art" aria-label="珠宝2048棋盘展示">
          <span class="orbit orbit-one" /><span class="orbit orbit-two" />
          <span class="art-sparkle art-sparkle-one">✧</span
          ><span class="art-sparkle art-sparkle-two">✧</span>
          <div class="sample-board">
            <div v-for="(value, index) in previewTiles" :key="index" class="sample-cell">
              <template v-if="value"
                ><GemIcon :value="value" /><span>{{ value }}</span></template
              >
            </div>
          </div>
          <div class="art-label">
            <GemIcon :value="2048" /><span
              >下一颗惊喜，等你发现<small>YOUR DIAMOND AWAITS</small></span
            >
          </div>
          <span class="art-caption">SMALL MOVES. BEAUTIFUL POSSIBILITIES.</span>
        </div>
      </div>
      <section class="home-bottom" aria-label="游戏介绍">
        <div class="home-step">
          <span class="step-number">01</span>
          <div>
            <h3>轻轻滑动</h3>
            <p>上下左右，让宝石靠近</p>
          </div>
        </div>
        <div class="home-step">
          <span class="step-number">02</span>
          <div>
            <h3>相遇，绽放</h3>
            <p>相同珠宝，合成新的璀璨</p>
          </div>
        </div>
        <div class="home-step">
          <span class="step-number">03</span>
          <div>
            <h3>收藏你的光</h3>
            <p>解锁11种珠宝，邂逅钻石</p>
          </div>
        </div>
        <button class="text-link" @click="screen = 'collection'">
          探索珠宝图鉴<AppIcon name="arrow" />
        </button>
      </section>
    </main>

    <main v-else-if="screen === 'game'" class="game-page">
      <aside class="atelier-intro">
        <p class="eyebrow"><span /> THE GEM ATELIER</p>
        <h1>每一次相遇，<br />都更<span class="gold-text">璀璨。</span></h1>
        <p class="intro-description">给自己一点放空的时间，<br />让指尖的微光，慢慢绽放。</p>
        <div class="intro-rule">
          <div class="mini-merge">
            <GemIcon :value="4" /><span>+</span><GemIcon :value="4" /><AppIcon
              name="arrow"
            /><GemIcon :value="8" />
          </div>
          <p>相同的宝石，合成新的惊喜</p>
        </div>
        <div class="keyboard-hint">
          <span>↑</span>
          <div><span>←</span><span>↓</span><span>→</span></div>
          <p>使用方向键或在棋盘上滑动</p>
        </div>
      </aside>

      <section class="play-area" aria-label="珠宝2048游戏">
        <div class="play-heading">
          <div>
            <span class="eyebrow">MERGE & SHINE</span>
            <h2>珠宝<span>2048</span></h2>
          </div>
          <span class="play-emblem"><AppIcon name="sparkle" /></span>
        </div>
        <div class="score-bar">
          <div class="score-box">
            <span>当前分数 <small>SCORE</small></span
            ><strong data-testid="score">{{ format(state.score) }}</strong
            ><span v-if="scoreGain" :key="state.score" class="score-gain">+{{ scoreGain }}</span>
          </div>
          <div class="score-divider" />
          <div class="score-box">
            <span>历史最高 <small>BEST</small></span
            ><strong data-testid="best">{{ format(state.bestScore) }}</strong
            ><AppIcon name="sparkle" />
          </div>
        </div>
        <GameBoard
          :tiles="renderedTiles"
          :merged-ids="mergedIds"
          :spawned-id="spawnedId"
          :active="boardActive"
          @move="move"
        />
        <div class="board-caption">
          <span class="tiny-diamond" /> 轻轻滑动，让美好相遇 <span class="tiny-diamond" />
        </div>
        <div class="game-controls">
          <button class="secondary-button" :disabled="!canUndo" @click="undo">
            <AppIcon name="undo" />撤销一步<span class="button-badge">{{
              state.undoUsed ? '已使用' : '免费 1 次'
            }}</span>
          </button>
          <button class="secondary-button" :disabled="busy" @click="modal = 'restart'">
            <AppIcon name="restart" />重新开始
          </button>
        </div>
        <div class="mobile-highest">
          <GemIcon :value="gameHighest" /><span
            >当前最高 <strong>{{ highestGem.name }}</strong></span
          ><button class="text-link" @click="screen = 'collection'">
            图鉴 {{ collectionCount }}/11<AppIcon name="chevron" />
          </button>
        </div>
      </section>

      <aside class="collection-sidebar">
        <div class="sidebar-title"><span>你的璀璨珍藏</span><AppIcon name="sparkle" /></div>
        <div class="highest-display">
          <div class="gem-halo" />
          <GemIcon :value="gameHighest" /><span class="eyebrow">CURRENT GEM</span>
          <h3>{{ highestGem.name }}</h3>
          <p>{{ highestGem.english }}</p>
          <span class="level-pill">{{ gameHighest }} <span>·</span> 等级 {{ level }}</span>
        </div>
        <div class="journey-progress">
          <div>
            <span>通往钻石的旅程</span><span>{{ level }} / 11</span>
          </div>
          <div class="progress-track"><span :style="{ width: `${(level / 11) * 100}%` }" /></div>
        </div>
        <div v-if="nextGem" class="next-gem">
          <GemIcon :value="nextGem.value" />
          <div>
            <small>下一次惊喜</small>
            <p>
              {{ nextGem.name }} <span>{{ nextGem.value }}</span>
            </p>
          </div>
          <AppIcon name="chevron" />
        </div>
        <div v-else class="diamond-message">钻石已点亮，璀璨仍在继续。</div>
        <button class="collection-link" @click="screen = 'collection'">
          <AppIcon name="grid" />我的珠宝图鉴<span>{{ collectionCount }}/11</span
          ><AppIcon name="arrow" />
        </button>
      </aside>
    </main>

    <main v-else class="collection-page">
      <div class="collection-heading">
        <div>
          <p class="eyebrow"><span /> YOUR LITTLE TREASURY</p>
          <h1>每一颗，都有<span class="gold-text">自己的光。</span></h1>
          <p>收藏旅途中的每一次惊喜，让微光汇成璀璨。</p>
        </div>
        <button
          class="secondary-button"
          @click="hasStarted ? (screen = 'game') : (screen = 'home')"
        >
          <AppIcon name="undo" />返回工坊
        </button>
      </div>
      <div class="collection-summary">
        <span>珠宝图鉴 <small>THE COLLECTION</small></span
        ><span
          >已点亮 <strong>{{ collectionCount }}</strong> / 11</span
        >
      </div>
      <div class="gem-gallery">
        <button
          v-for="(gem, index) in GEMS"
          :key="gem.value"
          class="gallery-item"
          :class="{ locked: !state.unlocked.includes(gem.value) }"
          :disabled="!state.unlocked.includes(gem.value)"
          :aria-label="
            state.unlocked.includes(gem.value)
              ? `${gem.name}，${gem.value}，查看详情`
              : `未解锁珠宝，${gem.value}`
          "
          @click="selectedGem = gem"
        >
          <span class="gallery-index">{{ String(index + 1).padStart(2, '0') }}</span><GemIcon
            :value="gem.value"
            :locked="!state.unlocked.includes(gem.value)"
          />
          <h3>{{ state.unlocked.includes(gem.value) ? gem.name : '等待点亮' }}</h3>
          <p>{{ state.unlocked.includes(gem.value) ? gem.english : 'A little mystery' }}</p>
          <span class="gallery-value"
            ><AppIcon v-if="!state.unlocked.includes(gem.value)" name="lock" />{{ gem.value }}</span
          >
        </button>
        <div class="gallery-ending">
          <AppIcon name="sparkle" />
          <p>慢慢来，<br />好事会闪光。</p>
          <small>KEEP YOUR SPARKLE</small>
        </div>
      </div>
      <p class="collection-note">已点亮的珠宝会一直留在这里，重新开始也不会丢失。</p>
    </main>

    <div v-if="storageWarning" class="storage-warning" role="status">{{ storageWarning }}</div>
    <footer class="site-footer">
      <span>GEM MERGE 2048</span
      ><span
        >一点闲暇，一点璀璨。<span class="footer-diamond">◇</span> MADE FOR YOUR LITTLE BREAK</span
      ><span>进度自动保存于此浏览器</span>
    </footer>
    <Transition name="toast"
      ><div v-if="toast" class="toast-message" role="status">
        <AppIcon name="sparkle" />{{ toast }}
      </div></Transition
    >

    <ModalDialog v-if="modal === 'help'" title="玩法说明" @close="modal = null">
      <span class="modal-emblem"><AppIcon name="diamond" /></span>
      <p class="eyebrow">A SMALL GUIDE</p>
      <h2>璀璨，从轻轻一滑开始</h2>
      <div class="help-rules">
        <p><b>01</b><span>在棋盘上上下左右滑动，或使用键盘方向键，移动所有珠宝。</span></p>
        <p><b>02</b><span>两颗相同的珠宝相遇，会合成为下一等级。每颗宝石每步只合并一次。</span></p>
        <p>
          <b>03</b><span>每次有效移动会出现一颗新宝石。合成钻石 2048 后，还可以继续挑战。</span>
        </p>
        <p>
          <b>04</b><span>棋盘填满且无法合并时游戏结束。每局有一次免费撤销，留给关键时刻。</span>
        </p>
      </div>
      <button class="primary-button full-width" @click="modal = null">
        开始寻找光芒<AppIcon name="arrow" />
      </button>
    </ModalDialog>

    <ModalDialog v-else-if="modal === 'restart'" title="重新开始" @close="modal = null">
      <span class="modal-emblem"><AppIcon name="restart" /></span>
      <p class="eyebrow">A FRESH START</p>
      <h2>开启一段新的璀璨？</h2>
      <p class="modal-description">当前棋盘与分数将重置。<br />历史最高分与珠宝图鉴会为你保留。</p>
      <button class="primary-button full-width" @click="newChallenge">
        重新开始<AppIcon name="arrow" /></button
      ><button class="text-button" @click="modal = null">再想一想，继续这局</button>
    </ModalDialog>

    <ModalDialog v-else-if="selectedGem" :title="selectedGem.name" @close="selectedGem = null">
      <GemIcon class="detail-gem" :value="selectedGem.value" />
      <p class="eyebrow">{{ selectedGem.english }}</p>
      <h2>{{ selectedGem.name }}</h2>
      <span class="level-pill"
        >{{ selectedGem.value }} · 等级 {{ Math.log2(selectedGem.value) }}</span
      >
      <p class="modal-description">{{ selectedGem.note }}</p>
      <button class="primary-button full-width" @click="selectedGem = null">
        收入珍藏<AppIcon name="sparkle" />
      </button>
    </ModalDialog>

    <ModalDialog v-else-if="endModal === 'win'" title="恭喜合成钻石" :closable="false">
      <div class="celebration" aria-hidden="true">
        <i v-for="n in 16" :key="n" :style="{ '--i': n }" />
      </div>
      <GemIcon class="detail-gem diamond-celebrate" :value="2048" />
      <p class="eyebrow">YOU FOUND YOUR BRILLIANCE</p>
      <h2>你的璀璨，终于成钻。</h2>
      <p class="modal-description">恭喜合成钻石 2048！<br />美好的相遇，还可以继续。</p>
      <p class="final-score">{{ format(state.score) }}<small>当前分数</small></p>
      <button class="primary-button full-width" @click="continueGame">
        继续闪耀<AppIcon name="sparkle" />
      </button>
    </ModalDialog>

    <ModalDialog v-else-if="endModal === 'over'" title="本次旅程结束" :closable="false">
      <GemIcon class="detail-gem" :value="gameHighest" />
      <p class="eyebrow">EVERY JOURNEY HAS ITS SHINE</p>
      <h2>这一程，也很璀璨。</h2>
      <p class="modal-description">
        棋盘已满，宝石暂时无法相遇。<br />带着 {{ highestGem.name }} 的光，期待下一次惊喜。
      </p>
      <p class="final-score">
        {{ format(state.score) }}<small>本次得分 · 历史最高 {{ format(state.bestScore) }}</small>
      </p>
      <button class="primary-button full-width" @click="newChallenge">
        再开启一段旅程<AppIcon name="arrow" /></button
      ><button v-if="canUndo" class="text-button" @click="undo">撤销上一步 · 免费 1 次</button
      ><button v-else class="text-button" @click="screen = 'collection'">看看我的珠宝珍藏</button>
    </ModalDialog>
  </div>
</template>
