import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FriendRequestsComponent } from './components/friend-requests/friend-requests.component';
import { GameMathComponent } from './components/game-math/game-math.component';
import { GameInfComponent } from './components/game-inf/game-inf.component';
import { GameResultComponent } from './components/game-result/game-result.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { loggedGuard } from './guards/logged.guard';
import { NewPasswordComponent } from './components/new-password/new-password.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [loggedGuard] }, 
    { path: 'register', component: RegisterComponent, canActivate: [loggedGuard] }, 
    { path: 'lobby', component: FriendRequestsComponent, canActivate: [authGuard] }, 
    { path: 'game-math/:gameId', component: GameMathComponent, canActivate: [authGuard] }, 
    { path: 'game-informatics/:gameId', component: GameInfComponent, canActivate: [authGuard] }, 
    // { path: 'game-result', component: GameResultComponent,canActivate: [authGuard] }, 
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] }, 
    { path: 'reset-password', component: ResetPasswordComponent, canActivate: [loggedGuard] }, 
    { path: 'new-password/:token', component: NewPasswordComponent },
    { path: '**', redirectTo: 'lobby', pathMatch: 'full' },
];
